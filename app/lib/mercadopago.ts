// Llamadas a la API de Mercado Pago. Solo se usa en el servidor.
// Necesita MP_ACCESS_TOKEN en .env.local (secreto: nunca con prefijo NEXT_PUBLIC_).

import { registrarPago, type NuevoPedido } from './pedidos';

const API = 'https://api.mercadopago.com';

export const hayMercadoPago = () => Boolean(process.env.MP_ACCESS_TOKEN);

async function mp(ruta: string, opciones: RequestInit = {}) {
  const respuesta = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: {
      Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
      ...opciones.headers,
    },
  });
  if (!respuesta.ok) {
    throw new Error(`Mercado Pago respondió ${respuesta.status} en ${ruta}: ${await respuesta.text()}`);
  }
  return respuesta.json();
}

// Crea el cobro (Checkout Pro) por el total exacto y devuelve la dirección a la que va el cliente.
export async function crearPreferencia(pedido: NuevoPedido, pedidoId: number | null, origen: string): Promise<string> {
  const items = pedido.items.map((i) => ({ id: i.id, title: i.nombre, quantity: i.cantidad, unit_price: i.precio, currency_id: 'UYU' }));
  if (pedido.envio > 0) items.push({ id: 'envio', title: 'Envío', quantity: 1, unit_price: pedido.envio, currency_id: 'UYU' });

  const https = origen.startsWith('https://');
  const preferencia = await mp('/checkout/preferences', {
    method: 'POST',
    body: JSON.stringify({
      items,
      payer: { name: pedido.nombre },
      metadata: { nombre: pedido.nombre, telefono: pedido.telefono, direccion: pedido.direccion, entrega: pedido.entrega },
      statement_descriptor: 'VIVO VINILO',
      // Con esto Mercado Pago nos dice a qué pedido corresponde cada pago.
      ...(pedidoId ? { external_reference: String(pedidoId) } : {}),
      back_urls: {
        success: `${origen}/pago/aprobado`,
        pending: `${origen}/pago/pendiente`,
        failure: `${origen}/pago/rechazado`,
      },
      // La vuelta automática y los avisos solo funcionan con el sitio publicado (https), no en localhost.
      ...(https ? { auto_return: 'approved', notification_url: `${origen}/api/mp/webhook` } : {}),
    }),
  });
  return preferencia.init_point as string;
}

// Le pregunta a Mercado Pago por un pago y actualiza el pedido que corresponda.
// Nunca se confía en lo que diga quien llama: el estado siempre sale de Mercado Pago.
export async function sincronizarPago(pagoId: string) {
  if (!/^\d+$/.test(pagoId)) return;
  const pago = await mp(`/v1/payments/${pagoId}`);
  const pedidoId = Number(pago.external_reference);
  if (!Number.isInteger(pedidoId)) return;
  await registrarPago(pedidoId, String(pago.id), String(pago.status), Number(pago.transaction_amount) || 0);
}

// Busca el último pago de un pedido (para consultar a mano desde el panel).
export async function sincronizarPedido(pedidoId: number): Promise<boolean> {
  const busqueda = await mp(`/v1/payments/search?external_reference=${pedidoId}&sort=date_created&criteria=desc&limit=1`);
  const pago = busqueda.results?.[0];
  if (!pago) return false;
  await registrarPago(pedidoId, String(pago.id), String(pago.status), Number(pago.transaction_amount) || 0);
  return true;
}

// Devuelve el pago completo al cliente.
export async function devolverPago(pagoId: string, pedidoId: number) {
  await mp(`/v1/payments/${pagoId}/refunds`, {
    method: 'POST',
    // La clave evita devolver dos veces si el pedido se manda repetido.
    headers: { 'X-Idempotency-Key': `devolucion-pedido-${pedidoId}` },
  });
}
