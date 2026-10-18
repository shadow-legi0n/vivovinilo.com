import Link from 'next/link';
import { Search, ShoppingCart, User } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="bg-oscuro text-white w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between border-b border-gray-800">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold tracking-tight">Vivo Vinilo</span>
          <span className="text-xs text-gray-400 hidden sm:block">Donde las ideas cobran vida</span>
        </Link>

        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <input 
            type="text" 
            placeholder="Buscar productos, servicios o ideas..." 
            className="w-full bg-zinc-900 text-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-marca"
          />
          <Search className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-6">
          <Link href="/carrito" className="hover:text-marca transition-colors">
            <ShoppingCart className="w-6 h-6" />
          </Link>
          <Link href="/login" className="hover:text-marca transition-colors">
            <User className="w-6 h-6" />
          </Link>
        </div>
      </div>

      <nav className="max-w-7xl mx-auto px-4 md:px-8">
        <ul className="flex items-center gap-8 h-12 text-sm font-medium overflow-x-auto whitespace-nowrap scrollbar-hide">
          <li><Link href="/" className="hover:text-marca transition-colors">Inicio</Link></li>
          <li><Link href="/lab" className="hover:text-marca transition-colors">LAB</Link></li>
          <li><Link href="/estudio" className="hover:text-marca transition-colors">ESTUDIO</Link></li>
          <li><Link href="/empresas" className="hover:text-marca transition-colors">Empresas y eventos</Link></li>
          <li><Link href="/experiencias" className="hover:text-marca transition-colors">Regalos con experiencias</Link></li>
          <li><Link href="/contacto" className="hover:text-marca transition-colors">Contacto y presupuestos</Link></li>
        </ul>
      </nav>
    </header>
  );
}