// Cuentas de clientes: contraseñas y sesiones. Solo se usa en el servidor.
//
// - La contraseña nunca se guarda: se guarda su hash scrypt con una sal distinta por cuenta.
// - La sesión es un token al azar en una cookie httpOnly. En la base queda solo el hash
//   del token, así que ni leyendo la base se puede entrar a una cuenta.

import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { base } from './db';

const COOKIE = 'vv_cliente';
const DURACION = 60 * 60 * 24 * 30; // 30 días, en segundos

export const CLAVE_MINIMA = 8;
const CLAVE_MAXIMA = 200; // tope para que nadie haga trabajar al servidor con claves gigantes

export interface Cliente {
  id: number;
  email: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

export function claveValida(clave: unknown): clave is string {
  return typeof clave === 'string' && clave.length >= CLAVE_MINIMA && clave.length <= CLAVE_MAXIMA;
}

// --- Contraseñas ---

// Costo de scrypt. Va guardado dentro de cada hash, así se puede subir más adelante
// sin invalidar las contraseñas que ya existen.
const COSTO = 32768;

function derivar(clave: string, sal: Buffer, costo: number): Promise<Buffer> {
  return new Promise((resolver, rechazar) => {
    scrypt(clave, sal, 32, { N: costo, r: 8, p: 1, maxmem: 256 * costo * 8 }, (error, clave) =>
      error ? rechazar(error) : resolver(clave)
    );
  });
}

async function hashear(clave: string) {
  const sal = randomBytes(16);
  const hash = await derivar(clave, sal, COSTO);
  return `scrypt$${COSTO}$${sal.toString('base64')}$${hash.toString('base64')}`;
}

async function coincide(clave: string, guardado: string) {
  const [tipo, costo, sal, hash] = guardado.split('$');
  if (tipo !== 'scrypt' || !sal || !hash) return false;
  const esperado = Buffer.from(hash, 'base64');
  const calculado = await derivar(clave, Buffer.from(sal, 'base64'), Number(costo));
  return esperado.length === calculado.length && timingSafeEqual(esperado, calculado);
}

// Hash de relleno: cuando el mail no existe se compara igual contra este, para que la
// respuesta tarde lo mismo y no se pueda averiguar qué mails tienen cuenta.
let relleno: Promise<string> | null = null;
const hashDeRelleno = () => (relleno ??= hashear(randomBytes(16).toString('hex')));

// --- Cuentas ---

/* eslint-disable @typescript-eslint/no-explicit-any */
const aCliente = (f: any): Cliente => ({ id: f.id, email: f.email, nombre: f.nombre, telefono: f.telefono, direccion: f.direccion });
/* eslint-enable @typescript-eslint/no-explicit-any */

// Devuelve la cuenta si el mail y la contraseña son correctos; si no, null.
export async function verificarCliente(email: string, clave: unknown): Promise<Cliente | null> {
  const sql = await base();
  if (!sql || typeof clave !== 'string' || clave.length > CLAVE_MAXIMA) return null;
  const [fila] = await sql`select * from clientes where email = ${email}`;
  const ok = await coincide(clave, fila ? fila.clave_hash : await hashDeRelleno());
  return fila && ok ? aCliente(fila) : null;
}

type Datos = { nombre: string; telefono: string; direccion: string };

// Crea la cuenta con la contraseña elegida. Si el mail ya tiene cuenta devuelve null
// (el "on conflict" cubre también dos compras simultáneas con el mismo mail).
export async function crearCliente(email: string, clave: string, datos: Datos): Promise<Cliente | null> {
  const sql = await base();
  if (!sql) return null;
  const [fila] = await sql`
    insert into clientes (email, clave_hash, nombre, telefono, direccion)
    values (${email}, ${await hashear(clave)}, ${datos.nombre}, ${datos.telefono}, ${datos.direccion})
    on conflict (email) do nothing
    returning *`;
  return fila ? aCliente(fila) : null;
}

// Guarda los datos de la última compra para completar el formulario la próxima vez.
// Una dirección vacía (retiro en el local) no pisa la que ya estaba guardada.
export async function actualizarDatos(id: number, datos: Datos) {
  const sql = await base();
  if (!sql) return;
  await sql`
    update clientes set
      nombre = ${datos.nombre},
      telefono = ${datos.telefono},
      direccion = case when ${datos.direccion} = '' then direccion else ${datos.direccion} end
    where id = ${id}`;
}

// --- Sesiones ---

const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export async function iniciarSesionCliente(clienteId: number) {
  const sql = await base();
  if (!sql) return;
  const token = randomBytes(32).toString('base64url');
  const vence = new Date(Date.now() + DURACION * 1000).toISOString();
  await sql`delete from sesiones where vence < now()`; // limpia las vencidas de paso
  await sql`insert into sesiones (token_hash, cliente_id, vence) values (${hashToken(token)}, ${clienteId}, ${vence})`;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DURACION,
    path: '/',
  });
}

export async function cerrarSesionCliente() {
  const almacen = await cookies();
  const token = almacen.get(COOKIE)?.value;
  almacen.delete(COOKIE);
  if (!token) return;
  const sql = await base();
  if (sql) await sql`delete from sesiones where token_hash = ${hashToken(token)}`;
}

// La cuenta de quien hace el pedido, o null si no inició sesión.
export async function clienteActual(): Promise<Cliente | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const sql = await base();
  if (!sql) return null;
  const [fila] = await sql`
    select c.* from sesiones s join clientes c on c.id = s.cliente_id
    where s.token_hash = ${hashToken(token)} and s.vence > now()`;
  return fila ? aCliente(fila) : null;
}
