'use client';

import Link from 'next/link';
import { ShoppingCart, User } from 'lucide-react';
import Buscador from './Buscador';
import { useCart } from '../context/CartContext';
import { navegacion } from '../lib/sitio';

export default function Navbar() {
  const { totalItems } = useCart();

  return (
    <header className="bg-oscuro text-white w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between border-b border-gray-800">
        <Link href="/" aria-label="Vivo Vinilo, inicio" className="flex items-center gap-3">
          <img src="/logo-emblema.png" alt="" width={48} height={48} className="w-12 h-12 rounded-full shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-xl sm:text-2xl font-extrabold tracking-tight uppercase whitespace-nowrap">
              Vivo <span className="text-[#F0145A]">Vinilo</span>
            </span>
            <span className="text-[10px] tracking-[0.3em] text-[#D9A566] mt-1 hidden sm:block">LAB &amp; STUDIO</span>
          </span>
        </Link>

        <Buscador className="hidden md:block flex-1 max-w-md mx-8" />

        <div className="flex items-center gap-6">
          <Link href="/carrito" aria-label="Carrito" className="relative hover:text-marca transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-marca text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Link>
          <Link href="/cuenta" aria-label="Mi cuenta" className="hover:text-marca transition-colors">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      {/* En celular el buscador va en su propia fila, debajo del logo */}
      <div className="md:hidden px-4 py-3 border-b border-gray-800">
        <Buscador />
      </div>

      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <ul className="flex items-center gap-8 h-12 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
          {navegacion.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-marca transition-colors">{item.nombre}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}