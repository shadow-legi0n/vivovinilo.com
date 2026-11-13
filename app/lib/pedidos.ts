// Pedidos: validación y acceso a la base de datos. Solo se usa en el servidor.
//
// La base es Postgres en Neon y se configura con DATABASE_URL en .env.local.
// Sin esa variable el sitio sigue andando, pero los pedidos no se guardan.

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { productos } from './catalogo';
import { calcularEnvio, ZONAS, type ZonaEnvio } from './envio';

export const METODOS = ['mercadopago', 'transferencia', 'redes'] as const;
export type MetodoPago = (typeof METODOS)[number];

export const ESTADOS = ['pendiente', 'pagado', 'aceptado', 'rechazado', 'entregado', 'devuelto'] as const;
export type EstadoPedido = (typeof ESTADOS)[number];

export interface ItemPedido {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export interface NuevoPedido {
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  entrega: ZonaEnvio;
  metodoPago: MetodoPago;
  items: ItemPedido[];
  subtotal: number;
  envio: number;
  total: number;
}

export interface Pedido extends NuevoPedido {
  id: number;
  creadoEn: string;
  estado: EstadoPedido;
  mpPagoId: string | null;
  mpEstado: string | null;
  clienteId: number | null;
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim().slice(0, 200) : '');

// El mail identifica la cuenta, así que se guarda siempre en minúsculas.
export function limpiarEmail(valor: unknown): string | null {
  const email = typeof valor === 'string' ? valor.trim().toLowerCase() : '';
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : null;
}

// Arma el pedido a partir de lo que manda el navegador. Del navegador solo se toman
// ids y cantidades: los precios y el envío salen del catálogo del servidor, porque
// si viajaran desde el navegador cualquiera podría cambiarlos y pagar menos.
export function validarPedido(datos: unknown): { error: string } | { pedido: NuevoPedido } {
  if (!datos || typeof datos !== 'object') return { error: 'Pedido inválido.' };
  const d = datos as Record<string, unknown>;

  const entrega = d.zonaEnvio as ZonaEnvio;
  if (!ZONAS.includes(entrega)) return { error: 'Elegí una modalidad de entrega.' };

  const metodoPago = d.metodoPago as MetodoPago;
  if (!METODOS.includes(metodoPago)) return { error: 'Elegí un método de pago.' };

  const nombre = texto(d.nombre);
  const telefono = texto(d.telefono);
  const direccion = texto(d.direccion);
  if (nombre.length < 3) return { error: 'Escribí tu nombre completo.' };
  const digitos = telefono.replace(/\D/g, '').length;
  if (digitos < 8 || digitos > 15) return { error: 'Escribí un celular válido, con al menos 8 números.' };
  const email = limpiarEmail(d.email);
  if (!email) return { error: 'Escribí un mail válido.' };
  if (entrega !== 'retiro' && direccion.length < 5) return { error: 'Escribí la dirección de entrega.' };

  if (!Array.isArray(d.items) || d.items.length === 0) return { error: 'El carrito está vacío.' };

  const items: ItemPedido[] = [];
  let subtotal = 0;
  for (const pedido of d.items as { id?: unknown; cantidad?: unknown }[]) {
    const producto = productos.find((p) => p.id === pedido?.id);
    const cantidad = Number(pedido?.cantidad);
    if (!producto || producto.precio === null) {
      return { error: 'Hay un producto en el carrito que ya no está disponible. Quitalo y volvé a intentar.' };
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) return { error: 'Cantidad inválida.' };
    subtotal += producto.precio * cantidad;
    items.push({ id: producto.id, nombre: producto.nombre, cantidad, precio: producto.precio });
  }

  const envio = calcularEnvio(entrega, subtotal);
  return { pedido: { nombre, email, telefono, direccion, entrega, metodoPago, items, subtotal, envio, total: subtotal + envio } };
}

// --- Base de datos ---

export const hayBase = () => Boolean(process.env.DATABASE_URL);

let tablasListas: Promise<void> | null = null;

// Crea o actualiza las tablas. Cada sentencia se puede repetir sin romper nada, así
// no hay un paso manual de instalación ni de migración.
async function prepararTablas(sql: NeonQueryFunction<false, false>) {
  await sql`
    create table if not exists pedidos (
      id serial primary key,
      creado_en timestamptz not null default now(),
      estado text not null default 'pendiente',
      nombre text not null,
      telefono text not null,
      direccion text not null default '',
      entrega text not null,
      metodo_pago text not null,
      items jsonb not null,
      subtotal integer not null,
      envio integer not null,
      total integer not null,
      mp_pago_id text,
      mp_estado text
    )`;
  await sql`
    create table if not exists clientes (
      id serial primary key,
      creado_en timestamptz not null default now(),
      email text not null unique,
      clave_hash text not null,
      nombre text not null default '',
      telefono text not null default '',
      direccion text not null default ''
    )`;
  // De cada sesión se guarda solo el hash del token: quien lea la base no puede entrar con eso.
  await sql`
    create table if not exists sesiones (
      token_hash text primary key,
      cliente_id integer not null references clientes(id) on delete cascade,
      vence timestamptz not null
    )`;
  await sql`alter table pedidos add column if not exists email text not null default ''`;
  await sql`alter table pedidos add column if not exists cliente_id integer references clientes(id) on delete set null`;
  await sql`create index if not exists pedidos_cliente_id on pedidos (cliente_id)`;
}

// Devuelve la conexión, preparando las tablas la primera vez. Sin DATABASE_URL devuelve null.
export async function base() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  tablasListas ??= prepararTablas(sql);
  try {
    await tablasListas;
  } catch (e) {
    tablasListas = null; // que el próximo intento vuelva a probar
    throw e;
  }
  return sql;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const aPedido = (f: any): Pedido => ({
  id: f.id,
  creadoEn: new Date(f.creado_en).toISOString(),
  estado: f.estado,
  nombre: f.nombre,
  email: f.email,
  telefono: f.telefono,
  direccion: f.direccion,
  entrega: f.entrega,
  metodoPago: f.metodo_pago,
  items: f.items,
  subtotal: f.subtotal,
  envio: f.envio,
  total: f.total,
  mpPagoId: f.mp_pago_id,
  mpEstado: f.mp_estado,
  clienteId: f.cliente_id,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// Guarda el pedido y devuelve su número, o null si no hay base configurada.
export async function crearPedido(p: NuevoPedido, clienteId: number | null = null): Promise<number | null> {
  const sql = await base();
  if (!sql) return null;
  const [fila] = await sql`
    insert into pedidos (cliente_id, nombre, email, telefono, direccion, entrega, metodo_pago, items, subtotal, envio, total)
    values (${clienteId}, ${p.nombre}, ${p.email}, ${p.telefono}, ${p.direccion}, ${p.entrega}, ${p.metodoPago}, ${JSON.stringify(p.items)}::jsonb, ${p.subtotal}, ${p.envio}, ${p.total})
    returning id`;
  return fila.id as number;
}

export async function listarPedidos(): Promise<Pedido[]> {
  const sql = await base();
  if (!sql) return [];
  const filas = await sql`select * from pedidos order by id desc limit 300`;
  return filas.map(aPedido);
}

// Los pedidos de una cuenta, para que el cliente los vea en "Mi cuenta".
export async function listarPedidosDeCliente(clienteId: number): Promise<Pedido[]> {
  const sql = await base();
  if (!sql) return [];
  const filas = await sql`select * from pedidos where cliente_id = ${clienteId} order by id desc limit 100`;
  return filas.map(aPedido);
}

export async function obtenerPedido(id: number): Promise<Pedido | null> {
  const sql = await base();
  if (!sql) return null;
  const [fila] = await sql`select * from pedidos where id = ${id}`;
  return fila ? aPedido(fila) : null;
}

export async function cambiarEstado(id: number, estado: EstadoPedido) {
  const sql = await base();
  if (!sql) return;
  await sql`update pedidos set estado = ${estado} where id = ${id}`;
}

// Anota lo que informó Mercado Pago sobre un pago. El pedido pasa a "pagado" solo si
// estaba pendiente, el pago está aprobado y el monto cubre el total.
export async function registrarPago(id: number, pagoId: string, mpEstado: string, monto: number) {
  const sql = await base();
  if (!sql) return;
  await sql`
    update pedidos set
      mp_pago_id = ${pagoId},
      mp_estado = ${mpEstado},
      estado = case
        when ${mpEstado} = 'approved' and estado = 'pendiente' and ${monto} >= total then 'pagado'
        when ${mpEstado} = 'refunded' then 'devuelto'
        else estado
      end
    where id = ${id}`;
}
