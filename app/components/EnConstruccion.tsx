import Link from 'next/link';

// Bloque para páginas que ya tienen ruta pero todavía no tienen contenido.
export default function EnConstruccion({ texto }: { texto: string }) {
  return (
    <section className="max-w-2xl mx-auto px-4 md:px-8 py-12">
      <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
        <p className="text-gray-600 mb-6">{texto}</p>
        <Link href="/contacto" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
          Ir a contacto
        </Link>
      </div>
    </section>
  );
}
