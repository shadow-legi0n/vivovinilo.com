import { crearPedido, validarPedido } from '../../lib/pedidos';
import { crearPreferencia, hayMercadoPago } from '../../lib/mercadopago';

// Recibe el carrito al confirmar la compra:
// 1. valida y calcula el total en el servidor,
// 2. guarda el pedido en la base,
// 3. si se paga con Mercado Pago, crea el cobro por el total exacto.
export async function POST(request: Request) {
  let datos: unknown;
  try {
    datos = await request.json();
  } catch {
    return Response.json({ error: 'Pedido inválido.' }, { status: 400 });
  }

  const resultado = validarPedido(datos);
  if ('error' in resultado) return Response.json({ error: resultado.error }, { status: 400 });
  const { pedido } = resultado;

  // Si la base falla, la venta sigue: el cliente igual puede pagar y mandar el pedido por WhatsApp.
  let numero: number | null = null;
  try {
    numero = await crearPedido(pedido);
  } catch (e) {
    console.error('No se pudo guardar el pedido:', e);
  }

  let url: string | null = null;
  if (pedido.metodoPago === 'mercadopago' && hayMercadoPago()) {
    try {
      url = await crearPreferencia(pedido, numero, new URL(request.url).origin);
    } catch (e) {
      console.error(e);
      return Response.json({ error: 'No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en un momento.', pedido: numero }, { status: 502 });
    }
  }

  return Response.json({ pedido: numero, url, total: pedido.total });
}
