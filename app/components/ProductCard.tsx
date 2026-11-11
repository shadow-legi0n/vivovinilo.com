import Link from 'next/link';
import AddToCartButton from './AddToCartButton';
import Foto from './Foto';
import type { Producto } from '../lib/catalogo';

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      <Foto src={producto.imagen} alt={producto.nombre} className={`w-full ${producto.vertical ? 'aspect-[5/7]' : 'aspect-[4/3]'}`} />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-texto mb-1">{producto.nombre}</h3>
        <p className="text-xs text-gray-500 mb-3">{producto.detalle}</p>
        {producto.precio === null ? (
          <>
            <p className="text-gray-700 font-semibold mb-4 mt-auto">Precio a cotizar</p>
            <Link href="/contacto" className="w-full inline-flex items-center justify-center bg-oscuro hover:bg-black text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors">
              Pedir presupuesto
            </Link>
          </>
        ) : (
          <>
            <p className="text-marca font-bold text-lg mb-4 mt-auto">
              {producto.desde && <span className="text-sm font-medium text-gray-500">Desde </span>}${producto.precio}
            </p>
            <AddToCartButton producto={producto} precio={producto.precio} />
          </>
        )}
      </div>
    </article>
  );
}
