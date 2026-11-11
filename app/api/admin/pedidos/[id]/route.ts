import { esAdmin } from '../../../../lib/admin';
import { cambiarEstado, obtenerPedido, type EstadoPedido } from '../../../../lib/pedidos';
import { devolverPago, hayMercadoPago, sincronizarPedido } from '../../../../lib/mercadopago';

const error = (mensaje: string, status: number) => Response.json({ error: mensaje }, { status });

const cambios: Record<string, EstadoPedido> = {
  aceptar: 'aceptado',
  rechazar: 'rechazado',
  entregar: 'entregado',
  pagado: 'pagado', // para marcar a mano transferencias y pagos en Abitab / Redpagos
};

// Acciones del panel sobre un pedido.
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await esAdmin())) return error('No autorizado.', 401);

  const id = Number((await params).id);
  const cuerpo = await request.json().catch(() => null);
  const accion = String(cuerpo?.accion ?? '');

  try {
    const pedido = Number.isInteger(id) ? await obtenerPedido(id) : null;
    if (!pedido) return error('Ese pedido no existe.', 404);

    if (accion in cambios) {
      await cambiarEstado(id, cambios[accion]);
    } else if (accion === 'verificar') {
      if (!hayMercadoPago()) return error('Falta configurar MP_ACCESS_TOKEN.', 503);
      if (!(await sincronizarPedido(id))) return error('Mercado Pago todavía no registra ningún pago para este pedido.', 404);
    } else if (accion === 'devolver') {
      if (!hayMercadoPago()) return error('Falta configurar MP_ACCESS_TOKEN.', 503);
      if (!pedido.mpPagoId || pedido.mpEstado !== 'approved') return error('Este pedido no tiene un pago aprobado de Mercado Pago para devolver.', 400);
      await devolverPago(pedido.mpPagoId, id);
      await cambiarEstado(id, 'devuelto');
    } else {
      return error('Acción desconocida.', 400);
    }

    return Response.json({ pedido: await obtenerPedido(id) });
  } catch (e) {
    console.error(`Falló la acción "${accion}" sobre el pedido ${id}:`, e);
    return error('No se pudo completar la acción. Revisá el pedido en Mercado Pago antes de reintentar.', 502);
  }
}
