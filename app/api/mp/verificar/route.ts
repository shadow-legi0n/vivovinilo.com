import { hayMercadoPago, sincronizarPago } from '../../../lib/mercadopago';

// La página de "pago aprobado" llama acá con el número de pago que trae la URL de vuelta.
// Sirve para que el pedido quede como pagado enseguida, y es la única vía en localhost,
// donde los avisos automáticos no llegan. El estado siempre se confirma con Mercado Pago.
export async function POST(request: Request) {
  const cuerpo = await request.json().catch(() => null);
  const pagoId = String(cuerpo?.pago ?? '');
  if (hayMercadoPago() && pagoId) {
    try {
      await sincronizarPago(pagoId);
    } catch (e) {
      console.error('No se pudo verificar el pago:', e);
    }
  }
  return new Response(null, { status: 204 });
}
