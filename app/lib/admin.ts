// Sesión del panel de pedidos. Solo se usa en el servidor.
//
// Hay un único usuario: el dueño. La contraseña va en ADMIN_PASSWORD (.env.local).
// Al entrar se guarda una cookie firmada con esa misma contraseña; JavaScript del
// navegador no la puede leer (httpOnly) y nadie la puede falsificar sin la clave.

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

const COOKIE = 'vv_admin';
const DURACION = 60 * 60 * 24 * 7; // 7 días, en segundos

const clave = () => process.env.ADMIN_PASSWORD ?? '';

export const hayAdmin = () => clave().length > 0;

const firmar = (vence: string) => createHmac('sha256', clave()).update(vence).digest('hex');

// Compara sin revelar por el tiempo de respuesta cuántos caracteres coinciden.
function iguales(a: string, b: string) {
  const x = createHmac('sha256', 'cmp').update(a).digest();
  const y = createHmac('sha256', 'cmp').update(b).digest();
  return timingSafeEqual(x, y);
}

export const claveCorrecta = (intento: unknown) => hayAdmin() && typeof intento === 'string' && iguales(intento, clave());

export async function iniciarSesion() {
  const vence = String(Math.floor(Date.now() / 1000) + DURACION);
  (await cookies()).set(COOKIE, `${vence}.${firmar(vence)}`, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: DURACION,
    path: '/',
  });
}

export async function cerrarSesion() {
  (await cookies()).delete(COOKIE);
}

export async function esAdmin() {
  if (!hayAdmin()) return false;
  const valor = (await cookies()).get(COOKIE)?.value ?? '';
  const [vence, firma] = valor.split('.');
  if (!vence || !firma) return false;
  return Number(vence) > Date.now() / 1000 && iguales(firma, firmar(vence));
}
