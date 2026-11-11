import { hayMercadoPago, sincronizarPago } from '../../../lib/mercadopago';

// Mercado Pago llama acá cada vez que cambia un pago (solo con el sitio publicado en https).
// El aviso trae nada más que el número de pago: el estado real se le pregunta a Mercado Pago,
// así un aviso falso no puede marcar un pedido como pagado.
export async function POST(request: Request) {
  if (!hayMercadoPago()) return new Response(null, { status: 200 });

  const url = new URL(request.url);
  const cuerpo = await request.json().catch(() => null);
  const esPago = (cuerpo?.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')) === 'payment';
  const pagoId = cuerpo?.data?.id ?? url.searchParams.get('data.id') ?? url.searchParams.get('id');

  if (esPago && pagoId) {
    try {
      await sincronizarPago(String(pagoId));
    } catch (e) {
      console.error('Falló el aviso de Mercado Pago:', e);
      return new Response(null, { status: 500 }); // con error, Mercado Pago reintenta más tarde
    }
  }
  return new Response(null, { status: 200 });
}
