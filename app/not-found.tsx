import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="bg-fondo w-full">
      <section className="max-w-2xl mx-auto px-4 md:px-8 py-24 text-center">
        <p className="text-marca font-bold mb-2">404</p>
        <h1 className="text-3xl md:text-4xl font-bold text-texto mb-4">No encontramos esa página</h1>
        <p className="text-gray-500 mb-8">Puede que el link esté mal o que la página ya no exista.</p>
        <Link href="/" className="inline-flex items-center bg-marca hover:bg-marca-hover text-white px-6 py-3 rounded-full font-medium transition-colors">
          Volver al inicio
        </Link>
      </section>
    </main>
  );
}
