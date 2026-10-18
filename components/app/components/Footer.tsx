import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-oscuro text-white py-12 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold tracking-tight mb-2">Vivo Vinilo</h2>
          <p className="text-gray-400 text-sm">Donde las ideas cobran vida.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-400">
          <Link href="/lab" className="hover:text-marca transition-colors">LAB</Link>
          <Link href="/estudio" className="hover:text-marca transition-colors">ESTUDIO</Link>
          <Link href="/empresas" className="hover:text-marca transition-colors">Empresas y eventos</Link>
          <Link href="/experiencias" className="hover:text-marca transition-colors">Regalos con experiencias</Link>
        </div>
        <div className="text-sm text-gray-400">
          <p className="mb-2 text-white font-medium">Atención</p>
          <p>Consultas por WhatsApp</p>
        </div>
      </div>
    </footer>
  );
}