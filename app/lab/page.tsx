import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import { CategoriasGrid, CategoriasGridCargando } from '../components/CategoriasGrid';
import { obtenerCatalogo } from '../lib/catalogo';

export const metadata: Metadata = {
  title: 'LAB',
  description: 'Productos y fabricación personalizada: sublimación, vinilo, DTF, impresión 3D y más.',
};

// Se arma en cada visita con el catálogo en caché, para que lo que se cambia desde el panel se vea enseguida.
async function ProductosPorCategoria() {
  await connection();
  const { categorias, productos } = await obtenerCatalogo();
  const visibles = productos.filter((p) => p.visible);

  return categorias.map((cat) => {
    const lista = visibles.filter((p) => p.categoria === cat.slug);
    if (lista.length === 0) return null;
    return (
      <section key={cat.slug} className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <h2 className="text-2xl font-bold text-texto mb-6">{cat.nombre}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {lista.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>
    );
  });
}

export default function LabPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="LAB" subtitulo="Productos y fabricación personalizada. Encontrá lo que buscás, aunque no sepas qué técnica se usa." />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold text-texto mb-6">Categorías</h2>
        <Suspense fallback={<CategoriasGridCargando />}>
          <CategoriasGrid />
        </Suspense>
      </section>

      {/* Productos agrupados por categoría (solo las que ya tienen productos) */}
      <Suspense fallback={<p className="text-center text-gray-500 pb-12">Cargando productos...</p>}>
        <ProductosPorCategoria />
      </Suspense>
    </main>
  );
}
