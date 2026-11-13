import { crearPedido, hayBase, validarPedido } from '../../lib/pedidos';
import {
  actualizarDatos,
  claveValida,
  clienteActual,
  crearCliente,
  iniciarSesionCliente,
  verificarCliente,
  CLAVE_MINIMA,
  type Cliente,
} from '../../lib/clientes';
import { crearPreferencia, hayMercadoPago } from '../../lib/mercadopago';

// Recibe el carrito al confirmar la compra:
// 1. valida y calcula el total en el servidor,
// 2. resuelve la cuenta del cliente: usa la sesión abierta o crea la cuenta con el mail y la contraseña elegidos,
// 3. guarda el pedido en la base, asociado a esa cuenta,
// 4. si se paga con Mercado Pago, crea el cobro por el total exacto.
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
  const clave = (datos as Record<string, unknown>).clave;

  // Cuenta del cliente. Si la base no responde, la venta sigue sin cuenta (igual que
  // con el pedido): es preferible vender a bloquear la compra.
  let cliente: Cliente | null = null;
  let cuenta: 'creada' | 'existente' | null = null;
  if (hayBase()) {
    let baseDisponible = true;
    try {
      cliente = await clienteActual();
    } catch (e) {
      baseDisponible = false;
      console.error('No se pudo leer la sesión del cliente:', e);
    }

    if (baseDisponible && cliente) {
      pedido.email = cliente.email; // con sesión abierta, el pedido va a esa cuenta
      cuenta = 'existente';
    } else if (baseDisponible) {
      if (!claveValida(clave)) {
        return Response.json({ error: `Elegí una contraseña de al menos ${CLAVE_MINIMA} caracteres para tu cuenta.` }, { status: 400 });
      }
      const contacto = { nombre: pedido.nombre, telefono: pedido.telefono, direccion: pedido.direccion };
      try {
        cliente = await crearCliente(pedido.email, clave, contacto);
        if (cliente) {
          cuenta = 'creada';
        } else {
          // El mail ya tiene cuenta: solo se acepta con la contraseña de esa cuenta. Sin
          // esto cualquiera podría meter pedidos en la cuenta de otro o pisarle la clave.
          cliente = await verificarCliente(pedido.email, clave);
          if (!cliente) {
            await new Promise((r) => setTimeout(r, 800)); // frena los intentos de adivinar la contraseña
            return Response.json(
              { error: 'Ya hay una cuenta con ese mail. Escribí la contraseña de esa cuenta o iniciá sesión antes de comprar.', cuentaExistente: true },
              { status: 409 }
            );
          }
          cuenta = 'existente';
        }
        await iniciarSesionCliente(cliente.id);
      } catch (e) {
        cliente = null;
        cuenta = null;
        console.error('No se pudo crear la cuenta del cliente:', e);
      }
    }

    if (cliente && cuenta === 'existente') {
      const contacto = { nombre: pedido.nombre, telefono: pedido.telefono, direccion: pedido.direccion };
      await actualizarDatos(cliente.id, contacto).catch((e) => console.error('No se pudieron actualizar los datos del cliente:', e));
    }
  }

  // Si la base falla, la venta sigue: el cliente igual puede pagar y mandar el pedido por WhatsApp.
  let numero: number | null = null;
  try {
    numero = await crearPedido(pedido, cliente?.id ?? null);
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

  return Response.json({ pedido: numero, url, total: pedido.total, cuenta });
}
