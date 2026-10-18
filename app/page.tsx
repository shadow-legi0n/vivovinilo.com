import { Palette, Mic, Users, Gift, ArrowRight, Video, Radio, Smartphone } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  // Categorías basadas en tu diseño de referencia
  const categorias = [
    { nombre: "Sublimación", href: "/lab" },
    { nombre: "Tazas, termos y mates", href: "/lab" },
    { nombre: "Indumentaria", href: "/lab" },
    { nombre: "Vinilo y DTF", href: "/lab" },
    { nombre: "Impresión 3D", href: "/lab" },
    { nombre: "Regalos y souvenirs", href: "/lab" },
    { nombre: "Personalizados", href: "/lab" },
    { nombre: "Diseños especiales", href: "/lab" },
  ];

  return (
    <main className="min-h-screen pb-20">
      {/* 1. SECCIÓN HERO */}
      <section className="bg-oscuro text-white py-20 px-4 relative overflow-hidden">
        {/* Aquí luego irá la imagen de fondo de tus productos con un overlay oscuro */}
        <div className="absolute inset-0 bg-gradient-to-r from-oscuro via-oscuro/90 to-oscuro/40 z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            Vivo Vinilo
          </h1>
          <h2 className="text-2xl md:text-3xl text-gray-300 font-light italic mb-6">
            Donde las ideas cobran vida
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-xl mb-10">
            Productos personalizados, producción audiovisual y musical, y mucho más.
          </p>
          <Link href="/lab" className="bg-marca hover:bg-marca-hover text-white px-8 py-3 rounded-full font-medium transition-colors inline-block">
            Explorar
          </Link>
        </div>
      </section>

      {/* 2. TARJETAS DE ACCESO RÁPIDO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-12 relative -mt-8 z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/lab" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-texto" />
            </div>
            <h3 className="font-semibold mb-1">LAB</h3>
            <p className="text-sm text-gray-500">Productos y fabricación personalizada</p>
          </Link>

          <Link href="/estudio" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-texto" />
            </div>
            <h3 className="font-semibold mb-1">ESTUDIO</h3>
            <p className="text-sm text-gray-500">Servicios audiovisuales y musicales</p>
          </Link>

          <Link href="/empresas" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-texto" />
            </div>
            <h3 className="font-semibold mb-1">Empresas y eventos</h3>
            <p className="text-sm text-gray-500">Soluciones por cantidad</p>
          </Link>

          <Link href="/experiencias" className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center border border-gray-100">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-texto" />
            </div>
            <h3 className="font-semibold mb-1">Regalos con experiencias</h3>
            <p className="text-sm text-gray-500">Productos + contenido digital</p>
          </Link>
        </div>
      </section>

      {/* 3. NUESTRAS CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-texto">Nuestras categorías</h2>
            <p className="text-gray-500">Encontrá lo que buscás, aunque no sepas qué técnica se usa</p>
          </div>
          <Link href="/lab" className="flex items-center text-sm font-medium text-gray-500 hover:text-marca transition-colors">
            Ver todas las categorías <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categorias.map((cat, i) => (
            <Link key={i} href={cat.href} className="group flex flex-col items-center">
              <div className="w-full bg-white rounded-xl aspect-square flex items-center justify-center border border-gray-100 mb-3 shadow-sm group-hover:shadow-md group-hover:border-marca/30 transition-all overflow-hidden">
                {/* Cuadro gris como placeholder para la imagen del producto */}
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-gray-50 transition-colors">
                  <span className="text-xs">Foto {i + 1}</span>
                </div>
              </div>
              <h3 className="text-sm font-medium text-center text-texto group-hover:text-marca transition-colors">{cat.nombre}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. REGALOS CON EXPERIENCIAS (Banner) */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-[#FDF2F8] border border-pink-100 rounded-2xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative">
          <div className="md:w-1/2 relative z-10 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4 text-texto">Regalos con experiencias</h2>
            <p className="text-gray-700 mb-6 max-w-md">Objetos que se combinan con música, videos, mensajes y más. El regalo perfecto para sorprender.</p>
            <Link href="/experiencias" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Ver opciones <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="md:w-1/2 flex justify-center relative z-10">
            {/* Representación visual de la caja con QR */}
            <div className="w-64 h-48 bg-white rounded-xl shadow-lg border border-pink-50 flex items-center justify-center p-6 transform rotate-2 hover:rotate-0 transition-transform cursor-pointer">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-900 mx-auto mb-3 flex items-center justify-center rounded-lg">
                  <span className="text-white text-xs text-center px-2">Código QR<br/>Escaneá acá</span>
                </div>
                <span className="text-sm font-bold text-marca">Escaneá y escuchá ♫</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN ESTUDIO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-oscuro rounded-3xl p-8 md:p-12 text-white overflow-hidden relative">
          <div className="relative z-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">ESTUDIO</h2>
              <p className="text-gray-400">Creamos, grabamos y transmitimos tus ideas.</p>
            </div>
            <Link href="/estudio" className="inline-flex items-center border border-gray-600 hover:border-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Conocer servicios <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div className="border border-gray-800 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
              <Video className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="font-semibold mb-2">Streaming</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Transmisiones en vivo y eventos</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
              <Radio className="w-8 h-8 text-marca mb-4" />
              <h3 className="font-semibold mb-2">Podcast</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Audio y video, entrevistas y programas</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
              <Mic className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="font-semibold mb-2">Grabaciones</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Voces, música e instrumentos</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 bg-white/5 hover:bg-white/10 transition-colors">
              <Smartphone className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold mb-2">Producciones</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Contenido musical, audiovisual y para redes</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}