// Pedidos: validación y acceso a la base de datos. Solo se usa en el servidor.
//
// La base es Postgres en Neon y se configura con DATABASE_URL en .env.local.
// Sin esa variable el sitio sigue andando, pero los pedidos no se guardan.

import { neon } from '@neondatabase/serverless';
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
}

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim().slice(0, 200) : '');

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
  if (!nombre || !telefono || (entrega !== 'retiro' && !direccion)) return { error: 'Faltan datos de contacto o de entrega.' };

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
  return { pedido: { nombre, telefono, direccion, entrega, metodoPago, items, subtotal, envio, total: subtotal + envio } };
}

// --- Base de datos ---

export const hayBase = () => Boolean(process.env.DATABASE_URL);

let tablaLista: Promise<unknown> | null = null;

// Devuelve la conexión, creando la tabla la primera vez (así no hay un paso manual de instalación).
async function base() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  tablaLista ??= sql`
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
  try {
    await tablaLista;
  } catch (e) {
    tablaLista = null; // que el próximo intento vuelva a probar
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
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// Guarda el pedido y devuelve su número, o null si no hay base configurada.
export async function crearPedido(p: NuevoPedido): Promise<number | null> {
  const sql = await base();
  if (!sql) return null;
  const [fila] = await sql`
    insert into pedidos (nombre, telefono, direccion, entrega, metodo_pago, items, subtotal, envio, total)
    values (${p.nombre}, ${p.telefono}, ${p.direccion}, ${p.entrega}, ${p.metodoPago}, ${JSON.stringify(p.items)}::jsonb, ${p.subtotal}, ${p.envio}, ${p.total})
    returning id`;
  return fila.id as number;
}

export async function listarPedidos(): Promise<Pedido[]> {
  const sql = await base();
  if (!sql) return [];
  const filas = await sql`select * from pedidos order by id desc limit 300`;
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
