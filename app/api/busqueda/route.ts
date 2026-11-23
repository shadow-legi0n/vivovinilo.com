import { connection } from 'next/server';
import { obtenerCatalogo } from '../../lib/catalogo';
import { armarEntradas } from '../../lib/busqueda';

// Índice del buscador del navbar. Se arma en cada pedido (no al publicar) desde el
// catálogo en caché, así un producto cargado en el panel aparece enseguida.
export async function GET() {
  await connection();
  try {
    return Response.json({ entradas: armarEntradas(await obtenerCatalogo()) });
  } catch (e) {
    console.error('No se pudo armar el índice de búsqueda:', e);
    return Response.json({ error: 'No pudimos cargar el buscador.' }, { status: 502 });
  }
}
