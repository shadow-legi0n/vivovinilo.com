'use client';

import { useState } from 'react';
import { Check, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import type { Producto } from '../lib/catalogo';

export default function AddToCartButton({ producto, precio }: { producto: Producto; precio: number }) {
  const { agregarAlCarrito } = useCart();
  const [agregado, setAgregado] = useState(false);

  const agregar = () => {
    agregarAlCarrito({
      id: producto.id,
      nombre: producto.nombre,
      precio,
      cantidad: 1,
      detalle: producto.detalle,
      imagen: producto.imagenes[0],
    });
    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  return (
    <button
      onClick={agregar}
      className="w-full inline-flex items-center justify-center gap-2 bg-marca hover:bg-marca-hover text-white px-4 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer"
    >
      {agregado ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
      {agregado ? 'Agregado' : 'Agregar al carrito'}
    </button>
  );
}
