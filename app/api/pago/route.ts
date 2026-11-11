import { productos } from '../../lib/catalogo';
import { calcularEnvio, ZONAS, type ZonaEnvio } from '../../lib/envio';

// Crea un pago de Mercado Pago (Checkout Pro) por el total exacto del carrito.
//
// El navegador solo manda qué productos y cuántos. Los precios y el envío se
// calculan acá, con el catálogo del servidor: si se confiara en el precio que
// manda el navegador, cualquiera podría cambiarlo y pagar menos.
//
// Necesita la variable MP_ACCESS_TOKEN en .env.local (y en el hosting).
// Nunca lleva el prefijo NEXT_PUBLIC_: es secreta y no debe llegar al navegador.

const error = (mensaje: string, status: number) => Response.json({ error: mensaje }, { status });

const texto = (valor: unknown) => (typeof valor === 'string' ? valor.trim().slice(0, 200) : '');

export async function POST(request: Request) {
  let datos: Record<string, unknown>;
  try {
    datos = await request.json();
  } catch {
    return error('Pedido inválido.', 400);
  }
  if (!datos || typeof datos !== 'object') return error('Pedido inválido.', 400);

  const zona = datos.zonaEnvio as ZonaEnvio;
  if (!ZONAS.includes(zona)) return error('Elegí una modalidad de entrega.', 400);

  const nombre = texto(datos.nombre);
  const telefono = texto(datos.telefono);
  const direccion = texto(datos.direccion);
  if (!nombre || !telefono || (zona !== 'retiro' && !direccion)) return error('Faltan datos de contacto o de entrega.', 400);

  if (!Array.isArray(datos.items) || datos.items.length === 0) return error('El carrito está vacío.', 400);

  const items = [];
  let subtotal = 0;
  for (const pedido of datos.items as { id?: unknown; cantidad?: unknown }[]) {
    const producto = productos.find((p) => p.id === pedido?.id);
    const cantidad = Number(pedido?.cantidad);
    if (!producto || producto.precio === null) {
      return error('Hay un producto en el carrito que ya no está disponible. Quitalo y volvé a intentar.', 400);
    }
    if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) return error('Cantidad inválida.', 400);

    subtotal += producto.precio * cantidad;
    items.push({ id: producto.id, title: producto.nombre, quantity: cantidad, unit_price: producto.precio, currency_id: 'UYU' });
  }

  const envio = calcularEnvio(zona, subtotal);
  if (envio > 0) {
    items.push({ id: 'envio', title: 'Envío', quantity: 1, unit_price: envio, currency_id: 'UYU' });
  }

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return error('sin_configurar', 503);

  const origen = new URL(request.url).origin;
  const respuesta = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items,
      payer: { name: nombre },
      // Estos datos quedan guardados junto al pago, para saber qué entregar y dónde.
      metadata: { nombre, telefono, direccion, entrega: zona },
      statement_descriptor: 'VIVO VINILO',
      back_urls: {
        success: `${origen}/pago/aprobado`,
        pending: `${origen}/pago/pendiente`,
        failure: `${origen}/pago/rechazado`,
      },
      // La vuelta automática al sitio solo se puede pedir con https (no en localhost).
      ...(origen.startsWith('https://') ? { auto_return: 'approved' } : {}),
    }),
  });

  if (!respuesta.ok) {
    console.error('Mercado Pago rechazó la preferencia:', respuesta.status, await respuesta.text());
    return error('No pudimos iniciar el pago con Mercado Pago. Probá de nuevo en un momento.', 502);
  }

  const preferencia = await respuesta.json();
  return Response.json({ url: preferencia.init_point, total: subtotal + envio });
}
