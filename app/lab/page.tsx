import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../components/PageHeader';
import ProductCard from '../components/ProductCard';
import Foto from '../components/Foto';
import { categorias, getProductosPorCategoria } from '../lib/catalogo';

export const metadata: Metadata = {
  title: 'LAB',
  description: 'Productos y fabricación personalizada: sublimación, vinilo, DTF, impresión 3D y más.',
};

export default function LabPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="LAB" subtitulo="Productos y fabricación personalizada. Encontrá lo que buscás, aunque no sepas qué técnica se usa." />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold text-texto mb-6">Categorías</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categorias.map((cat) => (
            <Link key={cat.slug} href={`/lab/${cat.slug}`} className="group flex flex-col items-center">
              <div className="w-full bg-white rounded-2xl aspect-[4/3] border border-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all overflow-hidden p-4">
                <Foto src={cat.img} alt={cat.nombre} className="w-full h-full rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-sm font-medium text-center text-texto group-hover:text-marca transition-colors">{cat.nombre}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Productos agrupados por categoría (solo las que ya tienen productos) */}
      {categorias.map((cat) => {
        const lista = getProductosPorCategoria(cat.slug);
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
      })}
    </main>
  );
}
