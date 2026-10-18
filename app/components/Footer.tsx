'use client'; 

import Link from 'next/link';
import { Camera, PlayCircle, ArrowUp, MessageCircle } from 'lucide-react'; 

export default function Footer() {
  return (
    <footer className="bg-oscuro text-white pt-16 pb-8 border-t border-gray-800 relative w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Columna 1: Logo y eslogan */}
        <div className="md:col-span-1">
          <Link href="/" className="flex flex-col gap-1 inline-block mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold tracking-tight">Vivo Vinilo</span>
              <span className="text-marca text-xl font-bold">-|||-</span>
            </div>
            <span className="text-sm text-gray-400 italic">Donde las ideas cobran vida</span>
          </Link>
        </div>

        {/* Columna 2: Navegación */}
        <div>
          <h3 className="font-semibold text-white mb-4">Navegación</h3>
          <div className="flex flex-col gap-3 text-sm text-gray-400">
            <Link href="/" className="hover:text-marca transition-colors">Inicio</Link>
            <Link href="/lab" className="hover:text-marca transition-colors">LAB</Link>
            <Link href="/estudio" className="hover:text-marca transition-colors">ESTUDIO</Link>
            <Link href="/empresas" className="hover:text-marca transition-colors">Empresas y eventos</Link>
            <Link href="/experiencias" className="hover:text-marca transition-colors">Regalos con experiencias</Link>
            <Link href="/contacto" className="hover:text-marca transition-colors">Contacto y presupuestos</Link>
          </div>
        </div>

        {/* Columna 3: Atención y Redes (Ocupa el resto) */}
        <div className="md:col-span-2">
          <h3 className="font-semibold text-white mb-4">Atención</h3>
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-6 cursor-pointer hover:text-marca transition-colors">
             <MessageCircle className="w-5 h-5" /> 
            <p>Consultas por WhatsApp</p>
          </div>
          <div className="flex gap-4 text-gray-400">
            {/* Íconos genéricos que representan redes */}
            <a href="#" className="hover:text-marca transition-colors border border-gray-600 rounded-full p-2 flex items-center justify-center">
              <Camera className="w-5 h-5" /> {/* Representa Instagram */}
            </a>
            <a href="#" className="hover:text-marca transition-colors border border-gray-600 rounded-full p-2 flex items-center justify-center">
              <PlayCircle className="w-5 h-5" /> {/* Representa YouTube */}
            </a>
          </div>
        </div>
      </div>

      {/* Botón Volver Arriba */}
      <div className="absolute right-8 bottom-24 hidden md:block">
         <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="bg-white text-oscuro p-2 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center">
            <ArrowUp className="w-5 h-5" />
         </button>
      </div>

      {/* Barra Inferior */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
        <p>© 2026 Vivo Vinilo. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <Link href="/terminos" className="hover:text-white transition-colors">Términos y condiciones</Link>
          <span className="text-gray-700">|</span>
          <Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link>
        </div>
      </div>
    </footer>
  );
}