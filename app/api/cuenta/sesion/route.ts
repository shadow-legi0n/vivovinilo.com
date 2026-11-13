import { cerrarSesionCliente, iniciarSesionCliente, verificarCliente } from '../../../lib/clientes';
import { hayBase, limpiarEmail } from '../../../lib/pedidos';

// Iniciar sesión con mail y contraseña.
export async function POST(request: Request) {
  if (!hayBase()) return Response.json({ error: 'Las cuentas no están disponibles en este momento.' }, { status: 503 });

  const cuerpo = await request.json().catch(() => null);
  const email = limpiarEmail(cuerpo?.email);

  try {
    const cliente = email ? await verificarCliente(email, cuerpo?.clave) : null;
    if (!cliente) {
      await new Promise((r) => setTimeout(r, 800)); // frena los intentos de adivinar la contraseña
      // El mismo mensaje para mail inexistente y clave incorrecta: no revela qué mails tienen cuenta.
      return Response.json({ error: 'Mail o contraseña incorrectos.' }, { status: 401 });
    }
    await iniciarSesionCliente(cliente.id);
    return Response.json({ ok: true });
  } catch (e) {
    console.error('No se pudo iniciar sesión:', e);
    return Response.json({ error: 'No pudimos conectar con la base de datos. Probá de nuevo en un momento.' }, { status: 502 });
  }
}

// Cerrar sesión.
export async function DELETE() {
  try {
    await cerrarSesionCliente();
  } catch (e) {
    console.error('No se pudo borrar la sesión de la base:', e); // la cookie ya se borró igual
  }
  return Response.json({ ok: true });
}
