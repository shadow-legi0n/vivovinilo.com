import { existsSync } from 'node:fs';
import path from 'node:path';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Mic, Radio, Smartphone, Video } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Foto from '../components/Foto';

export const metadata: Metadata = {
  title: 'ESTUDIO',
  description: 'Servicios audiovisuales y musicales: streaming, podcast, grabaciones y producciones.',
};

// Los afiches van en public/estudio con estos nombres. Si un archivo todavía no está,
// simplemente no se muestra (en vez de una imagen rota). Se revisa al generar la página.
function afiche(nombre: string) {
  const archivo = `${nombre}.jpg`;
  return existsSync(path.join(process.cwd(), 'public', 'estudio', archivo)) ? `/estudio/${archivo}` : undefined;
}

const servicios = [
  { icono: Video, color: 'text-cyan-500', nombre: 'Streaming', texto: 'Transmisiones en vivo y eventos', foto: 'en-vivo-con-tu-estilo' },
  { icono: Radio, color: 'text-blue-500', nombre: 'Podcast', texto: 'Audio y video, entrevistas y programas', foto: 'tu-podcast-empieza-aca' },
  { icono: Mic, color: 'text-purple-500', nombre: 'Grabaciones', texto: 'Voces, música e instrumentos', foto: 'estudio-de-grabacion' },
  { icono: Smartphone, color: 'text-pink-500', nombre: 'Producciones', texto: 'Contenido musical, audiovisual y para redes', foto: 'una-cancion-hecha-para-vos' },
];

const galeria = [
  { foto: 'tu-espacio-para-crear', alt: 'Vivo Vinilo Studio: tu espacio para crear. Streaming, podcast y música.' },
  { foto: 'ideas-que-se-escuchan', alt: 'Ideas que se escuchan: producción de podcast' },
  { foto: 'graba-tu-cancion', alt: 'Grabá tu canción: un espacio para crear y sonar' },
];

export default function EstudioPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="ESTUDIO" subtitulo="Creamos, grabamos y transmitimos tus ideas." />

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <h2 className="text-2xl font-bold text-texto mb-6">Servicios</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicios.map(({ icono: Icono, color, nombre, texto, foto }) => (
            <div key={nombre} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {afiche(foto) && <Foto src={afiche(foto)} alt={`${nombre}: ${texto}`} className="w-full aspect-[11/12] object-top" />}
              <div className="p-6">
                <Icono className={`w-8 h-8 mb-4 ${color}`} />
                <h3 className="font-semibold text-texto mb-2">{nombre}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-12">
        <h2 className="text-2xl font-bold text-texto mb-6">Tu espacio para crear</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {galeria.map(({ foto, alt }) =>
            afiche(foto) ? <Foto key={foto} src={afiche(foto)} alt={alt} className="w-full aspect-[11/12] rounded-2xl shadow-sm" /> : null
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 md:px-8 pb-16">
        <div className="bg-oscuro text-white rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">¿Tenés un proyecto en mente?</h2>
            <p className="text-gray-400">Vení con tu idea. Nosotros ponemos el espacio y el equipo.</p>
          </div>
          <Link href="/contacto" className="inline-flex items-center bg-marca hover:bg-marca-hover px-6 py-3 rounded-full text-sm font-medium transition-colors self-start md:self-auto">
            Consultar <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </section>
    </main>
  );
}
