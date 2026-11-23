import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import AddToCartButton from '../../../components/AddToCartButton';
import Galeria from './Galeria';
import { getCategoria, getProducto } from '../../../lib/catalogo';

// Igual que la página de categoría: se resuelve con el id de la URL y queda en caché
// hasta que el producto se edite desde el panel.
export const instant = false;

export async function generateMetadata({ params }: PageProps<'/lab/[categoria]/[producto]'>): Promise<Metadata> {
  const { producto: id } = await params;
  const producto = await getProducto(id);
  if (!producto) return {};
  return {
    title: producto.nombre,
    description: producto.descripcion || producto.detalle,
    openGraph: producto.imagenes[0] ? { images: [producto.imagenes[0]] } : undefined,
  };
}

export default async function ProductoPage({ params }: PageProps<'/lab/[categoria]/[producto]'>) {
  const { categoria: slug, producto: id } = await params;
  const producto = await getProducto(id);
  // Si el producto cambió de categoría, la dirección vieja igual lo encuentra.
  if (!producto) notFound();
  const categoria = await getCategoria(producto.categoria);
  const volver = `/lab/${categoria?.slug ?? slug}`;

  return (
    <main className="bg-fondo w-full">
      <section className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <Link href={volver} className="inline-flex items-center text-sm text-gray-500 hover:text-marca transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" /> {categoria ? categoria.nombre : 'Volver al LAB'}
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          <Galeria imagenes={producto.imagenes} nombre={producto.nombre} />

          <div className="flex flex-col">
            <h1 className="text-3xl md:text-4xl font-bold text-texto mb-2">{producto.nombre}</h1>
            {producto.detalle && <p className="text-gray-500 mb-4">{producto.detalle}</p>}

            {producto.precio === null ? (
              <p className="text-xl font-semibold text-gray-700 mb-6">Precio a cotizar</p>
            ) : (
              <p className="text-3xl font-bold text-marca mb-6">
                {producto.desde && <span className="text-base font-medium text-gray-500">Desde </span>}${producto.precio}
              </p>
            )}

            {producto.descripcion && (
              <div className="text-gray-700 leading-relaxed whitespace-pre-line mb-8">{producto.descripcion}</div>
            )}

            <div className="mt-auto max-w-sm">
              {producto.precio === null ? (
                <Link
                  href="/contacto"
                  className="w-full inline-flex items-center justify-center bg-oscuro hover:bg-black text-white px-4 py-3 rounded-full font-medium transition-colors"
                >
                  Pedir presupuesto
                </Link>
              ) : (
                <AddToCartButton producto={producto} precio={producto.precio} />
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
