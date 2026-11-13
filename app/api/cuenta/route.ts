import { connection } from 'next/server';
import { clienteActual } from '../../lib/clientes';
import { listarPedidosDeCliente } from '../../lib/pedidos';

// Datos y pedidos de quien inició sesión. Sin sesión responde 401.
export async function GET() {
  // Depende de la cookie de quien consulta: se resuelve en cada pedido, nunca al compilar.
  await connection();
  try {
    const cliente = await clienteActual();
    if (!cliente) return Response.json({ error: 'No iniciaste sesión.' }, { status: 401 });

    const pedidos = await listarPedidosDeCliente(cliente.id);
    return Response.json({
      cliente: { email: cliente.email, nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion },
      // Al cliente se le manda solo lo que necesita ver de cada pedido.
      pedidos: pedidos.map((p) => ({
        id: p.id,
        creadoEn: p.creadoEn,
        estado: p.estado,
        entrega: p.entrega,
        metodoPago: p.metodoPago,
        items: p.items,
        envio: p.envio,
        total: p.total,
      })),
    });
  } catch (e) {
    console.error('No se pudo leer la cuenta:', e);
    return Response.json({ error: 'No pudimos conectar con la base de datos.' }, { status: 502 });
  }
}
