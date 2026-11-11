import { esAdmin, hayAdmin } from '../../../lib/admin';
import { hayBase, listarPedidos } from '../../../lib/pedidos';
import { hayMercadoPago } from '../../../lib/mercadopago';

// Lista de pedidos para el panel. Sin sesión de administrador no devuelve nada.
export async function GET() {
  if (!hayAdmin()) return Response.json({ error: 'Falta configurar ADMIN_PASSWORD en el servidor.' }, { status: 503 });
  if (!(await esAdmin())) return Response.json({ error: 'No autorizado.' }, { status: 401 });
  if (!hayBase()) return Response.json({ error: 'Falta configurar DATABASE_URL en el servidor.' }, { status: 503 });

  try {
    return Response.json({ pedidos: await listarPedidos(), mercadoPago: hayMercadoPago() });
  } catch (e) {
    console.error('No se pudieron leer los pedidos:', e);
    return Response.json({ error: 'No pudimos conectar con la base de datos.' }, { status: 502 });
  }
}
