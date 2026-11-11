import { cerrarSesion, claveCorrecta, hayAdmin, iniciarSesion } from '../../../lib/admin';

// Entrar al panel.
export async function POST(request: Request) {
  if (!hayAdmin()) return Response.json({ error: 'Falta configurar ADMIN_PASSWORD en el servidor.' }, { status: 503 });

  const cuerpo = await request.json().catch(() => null);
  if (!claveCorrecta(cuerpo?.clave)) {
    await new Promise((r) => setTimeout(r, 800)); // frena los intentos de adivinar la contraseña
    return Response.json({ error: 'Contraseña incorrecta.' }, { status: 401 });
  }
  await iniciarSesion();
  return Response.json({ ok: true });
}

// Salir del panel.
export async function DELETE() {
  await cerrarSesion();
  return Response.json({ ok: true });
}
