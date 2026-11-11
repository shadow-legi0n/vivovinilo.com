import AddToCartButton from './AddToCartButton';
import type { Producto } from '../lib/catalogo';

export default function ProductCard({ producto }: { producto: Producto }) {
  return (
    <article className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={producto.imagen} alt={producto.nombre} className="w-full aspect-[4/3] object-cover" />
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-semibold text-texto mb-1">{producto.nombre}</h3>
        <p className="text-xs text-gray-500 mb-3">{producto.detalle}</p>
        <p className="text-marca font-bold text-lg mb-4 mt-auto">${producto.precio}</p>
        <AddToCartButton producto={producto} />
      </div>
    </article>
  );
}
