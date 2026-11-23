import { obtenerCatalogo } from '../../lib/catalogo';
import { armarEntradas } from '../../lib/busqueda';

// Índice del buscador del navbar. Sale del catálogo en caché, así que se actualiza
// solo cuando se edita un producto desde el panel.
export async function GET() {
  try {
    return Response.json({ entradas: armarEntradas(await obtenerCatalogo()) });
  } catch (e) {
    console.error('No se pudo armar el índice de búsqueda:', e);
    return Response.json({ error: 'No pudimos cargar el buscador.' }, { status: 502 });
  }
}
