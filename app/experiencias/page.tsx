import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Gift, Music, QrCode } from 'lucide-react';
import PageHeader from '../components/PageHeader';

export const metadata: Metadata = {
  title: 'Regalos con experiencias',
  description: 'Objetos que se combinan con música, videos, mensajes y más.',
};

const pasos = [
  { icono: Gift, titulo: 'Elegís el objeto', texto: 'Una taza, un termo, una remera o lo que quieras regalar.' },
  { icono: Music, titulo: 'Sumás el contenido', texto: 'Una canción, un video o un mensaje para esa persona.' },
  { icono: QrCode, titulo: 'Se escanea y se disfruta', texto: 'El regalo lleva un código QR que abre el contenido.' },
];

export default function ExperienciasPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Regalos con experiencias" subtitulo="Objetos que se combinan con música, videos, mensajes y más." />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold text-texto mb-6">Cómo funciona</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pasos.map(({ icono: Icono, titulo, texto }, i) => (
            <div key={titulo} className="bg-white border border-pink-100 rounded-2xl p-6 shadow-sm">
              <div className="w-12 h-12 bg-marca/10 rounded-full flex items-center justify-center mb-4">
                <Icono className="w-6 h-6 text-marca" />
              </div>
              <h3 className="font-semibold text-texto mb-2">
                {i + 1}. {titulo}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="bg-[#FDF2F8] border border-pink-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-texto mb-2">Armemos tu regalo</h2>
            <p className="text-gray-700">Contanos para quién es y qué querés que escuche o vea.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/lab" className="inline-flex items-center border border-gray-300 hover:border-oscuro text-texto px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Ver productos
            </Link>
            <Link href="/contacto" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Consultar <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
