import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import ProductCard from '../../components/ProductCard';
import { categorias, getCategoria, getProductosPorCategoria } from '../../lib/catalogo';

// Le dice a Next qué categorías existen para generar cada página en el build.
export function generateStaticParams() {
  return categorias.map((c) => ({ categoria: c.slug }));
}

export async function generateMetadata({ params }: PageProps<'/lab/[categoria]'>): Promise<Metadata> {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  return categoria ? { title: categoria.nombre, description: categoria.descripcion } : {};
}

export default async function CategoriaPage({ params }: PageProps<'/lab/[categoria]'>) {
  const { categoria: slug } = await params;
  const categoria = getCategoria(slug);
  if (!categoria) notFound();

  const productos = getProductosPorCategoria(slug);

  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo={categoria.nombre} subtitulo={categoria.descripcion}>
        <Link href="/lab" className="inline-flex items-center text-sm text-gray-300 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Volver al LAB
        </Link>
      </PageHeader>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {productos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {productos.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-texto mb-2">Todavía no hay productos cargados en esta categoría</h2>
            <p className="text-gray-500 mb-6">Contanos tu idea y te pasamos un presupuesto a medida.</p>
            <Link href="/contacto" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Pedir presupuesto <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
