import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export const metadata: Metadata = {
  title: 'Empresas y eventos',
  description: 'Regalos, merchandising y soluciones por cantidad para cada ocasión.',
};

const ocasiones = [
  'Cumpleaños y aniversarios',
  'Egresados',
  'Baby showers y revelaciones',
  'Casamientos y celebraciones',
  'Artistas, bandas y espectáculos',
  'Souvenirs y pedidos por cantidad',
];

export default function EmpresasPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Empresas y eventos" subtitulo="Regalos, merchandising y soluciones para cada ocasión.">
        <Link href="/contacto" className="inline-flex items-center bg-marca hover:bg-marca-hover text-white px-6 py-3 rounded-full text-sm font-medium transition-colors">
          Solicitar presupuesto <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </PageHeader>

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-bold text-texto mb-6">¿Para qué ocasión?</h2>
            <ul className="space-y-3">
              {ocasiones.map((o) => (
                <li key={o} className="flex items-center text-gray-700">
                  <CheckCircle className="w-5 h-5 mr-3 text-marca shrink-0" /> {o}
                </li>
              ))}
            </ul>
          </div>
          <div className="h-56 md:h-auto rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=800&auto=format&fit=crop" alt="Merchandising para empresas" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>
    </main>
  );
}
