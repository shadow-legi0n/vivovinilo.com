import Link from 'next/link';
import { connection } from 'next/server';
import Foto from './Foto';
import { getCategorias } from '../lib/catalogo';

// Grilla de categorías. Se arma en cada visita (con el catálogo en caché) para que lo
// que se cambia desde el panel se vea enseguida, aunque el resto de la página sea fija.
export async function CategoriasGrid() {
  await connection();
  const categorias = await getCategorias();
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {categorias.map((cat) => (
        <Link key={cat.slug} href={`/lab/${cat.slug}`} className="group flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl aspect-[4/3] flex items-center justify-center border border-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all overflow-hidden p-4">
            <Foto src={cat.img} alt={cat.nombre} className="w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-500" />
          </div>
          <h3 className="text-sm font-medium text-center text-texto group-hover:text-marca transition-colors">{cat.nombre}</h3>
        </Link>
      ))}
    </div>
  );
}

// Lo que se ve durante el instante en que llega la grilla.
export function CategoriasGridCargando() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="flex flex-col items-center">
          <div className="w-full bg-white rounded-2xl aspect-[4/3] border border-gray-100 mb-3 shadow-sm animate-pulse" />
          <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}
