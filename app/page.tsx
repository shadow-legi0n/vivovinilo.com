import { Palette, Mic, Users, Gift, ArrowRight, Video, Radio, Smartphone, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Footer from "@/app/components/Footer";

export default function Home() {
  const categorias = [
    { nombre: "Sublimación", href: "/lab", img: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Tazas, termos y mates", href: "/lab", img: "https://images.unsplash.com/photo-1517254456976-ee8f02088d43?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Indumentaria", href: "/lab", img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Vinilo y DTF", href: "/lab", img: "https://images.unsplash.com/photo-1620012253295-c15bc3e6554c?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Impresión 3D", href: "/lab", img: "https://images.unsplash.com/photo-1615962122149-a417df85dc74?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Regalos y souvenirs", href: "/lab", img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Personalizados", href: "/lab", img: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=400&auto=format&fit=crop" },
    { nombre: "Diseños especiales", href: "/lab", img: "https://images.unsplash.com/photo-1561016444-14fd547ea40f?q=80&w=400&auto=format&fit=crop" },
  ];

  return (
    <main className="min-h-screen bg-fondo">
      {/* 1. HERO CON IMAGEN */}
      <section className="relative text-white py-24 px-4 overflow-hidden min-h-[500px] flex items-center">
        <img src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1920&auto=format&fit=crop" alt="Estudio" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-r from-oscuro via-oscuro/80 to-transparent z-0"></div>
        
        <div className="max-w-7xl mx-auto w-full relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">Vivo Vinilo</h1>
          <h2 className="text-2xl md:text-3xl text-gray-200 font-light italic mb-6">Donde las ideas cobran vida</h2>
          <p className="text-lg md:text-xl text-gray-300 max-w-xl mb-10">Productos personalizados, producción audiovisual y musical, y mucho más.</p>
          <Link href="/lab" className="bg-marca hover:bg-marca-hover text-white px-8 py-3 rounded-full font-medium transition-colors inline-block shadow-lg">
            Explorar
          </Link>
        </div>
      </section>

      {/* 2. TARJETAS DE ACCESO RÁPIDO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 relative -mt-12 z-20 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/lab" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center border border-gray-100 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Palette className="w-6 h-6 text-texto" />
            </div>
            <h3 className="font-semibold mb-1 text-texto">LAB</h3>
            <p className="text-sm text-gray-500">Productos y fabricación personalizada</p>
          </Link>

          <Link href="/estudio" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center border border-gray-100 transform hover:-translate-y-1">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Mic className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1 text-texto">ESTUDIO</h3>
            <p className="text-sm text-gray-500">Servicios audiovisuales y musicales</p>
          </Link>

          <Link href="/empresas" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center border border-orange-50 transform hover:-translate-y-1 bg-orange-50/30">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-1 text-texto">Empresas y eventos</h3>
            <p className="text-sm text-gray-500">Soluciones por cantidad</p>
          </Link>

          <Link href="/experiencias" className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all flex flex-col items-center text-center border border-pink-50 transform hover:-translate-y-1 bg-pink-50/30">
            <div className="w-12 h-12 bg-marca/10 rounded-full flex items-center justify-center mb-4">
              <Gift className="w-6 h-6 text-marca" />
            </div>
            <h3 className="font-semibold mb-1 text-texto">Regalos con experiencias</h3>
            <p className="text-sm text-gray-500">Productos + contenido digital</p>
          </Link>
        </div>
      </section>

      {/* 3. NUESTRAS CATEGORÍAS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2 text-texto">Nuestras categorías</h2>
            <p className="text-gray-500">Encontrá lo que buscás, aunque no sepas qué técnica se usa</p>
          </div>
          <Link href="/lab" className="flex items-center text-sm font-medium text-gray-500 hover:text-marca transition-colors">
            Ver todas las categorías <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categorias.map((cat, i) => (
            <Link key={i} href={cat.href} className="group flex flex-col items-center">
              <div className="w-full bg-white rounded-2xl aspect-[4/3] flex items-center justify-center border border-gray-100 mb-3 shadow-sm group-hover:shadow-md transition-all overflow-hidden p-4">
                <img src={cat.img} alt={cat.nombre} className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500" />
              </div>
              <h3 className="text-sm font-medium text-center text-texto group-hover:text-marca transition-colors">{cat.nombre}</h3>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. REGALOS CON EXPERIENCIAS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-[#FDF2F8] border border-pink-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between overflow-hidden relative shadow-sm">
          <div className="md:w-1/2 relative z-10 mb-8 md:mb-0">
            <h2 className="text-3xl font-bold mb-4 text-texto">Regalos con experiencias</h2>
            <p className="text-gray-700 mb-6 max-w-md">Objetos que se combinan con música, videos, mensajes y más.</p>
            <Link href="/experiencias" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Ver opciones <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center relative z-10">
            <div className="w-72 bg-[#fdf0e3] rounded-xl shadow-lg flex items-center p-6 transform rotate-2 hover:rotate-0 transition-transform">
              <div className="w-24 h-24 bg-white p-2 rounded-lg mr-4 shadow-sm">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=VivoVinilo" alt="QR Code" className="w-full h-full" />
              </div>
              <div>
                <span className="text-lg font-bold text-texto block">Escaneá</span>
                <span className="text-lg font-bold text-texto block mb-1">y escuchá</span>
                <span className="text-2xl">🎵</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. EMPRESAS Y EVENTOS */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row shadow-sm gap-8">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold mb-4 text-texto">Empresas y eventos</h2>
            <p className="text-gray-600 mb-8">Regalos, merchandising y soluciones para cada ocasión.</p>
            <Link href="/empresas" className="inline-flex items-center bg-oscuro text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Solicitar presupuesto <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="md:w-1/3 flex flex-col justify-center gap-3">
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Cumpleaños y aniversarios</p>
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Egresados</p>
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Baby showers y revelaciones</p>
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Casamientos y celebraciones</p>
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Artistas, bandas y espectáculos</p>
            <p className="flex items-center text-gray-700 text-sm"><CheckCircle className="w-4 h-4 mr-2 text-gray-400"/> Souvenirs y pedidos por cantidad</p>
          </div>

          <div className="md:w-1/3 h-48 md:h-auto rounded-2xl overflow-hidden relative">
             <img src="https://images.unsplash.com/photo-1556761175-5973dc0f32b7?q=80&w=600&auto=format&fit=crop" alt="Merchandising" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* 6. SECCIÓN ESTUDIO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-oscuro rounded-3xl p-8 md:p-12 text-white overflow-hidden shadow-xl">
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">ESTUDIO</h2>
              <p className="text-gray-400">Creamos, grabamos y transmitimos tus ideas.</p>
            </div>
            <Link href="/estudio" className="inline-flex items-center border border-gray-600 hover:border-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Conocer servicios <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div className="border border-gray-800 rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <Video className="w-8 h-8 text-cyan-400 mb-4" />
              <h3 className="font-semibold mb-2">Streaming</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Transmisiones en vivo y eventos</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <Radio className="w-8 h-8 text-blue-400 mb-4" />
              <h3 className="font-semibold mb-2">Podcast</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Audio y video, entrevistas y programas</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <Mic className="w-8 h-8 text-purple-400 mb-4" />
              <h3 className="font-semibold mb-2">Grabaciones</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Voces, música e instrumentos</p>
            </div>
            <div className="border border-gray-800 rounded-2xl p-6 hover:bg-white/5 transition-colors">
              <Smartphone className="w-8 h-8 text-pink-400 mb-4" />
              <h3 className="font-semibold mb-2">Producciones</h3>
              <p className="text-sm text-gray-400 leading-relaxed">Contenido musical, audiovisual y para redes</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. TU IDEA, NUESTRO TRABAJO */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mb-16">
        <div className="bg-white border border-gray-100 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between shadow-sm gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-texto">Tu idea, nuestro trabajo</h2>
            <p className="text-gray-600 mb-6">Personalizá, regalá, compartí. En Vivo Vinilo, cada proyecto es único.</p>
            <Link href="/contacto" className="inline-flex items-center bg-oscuro text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-black transition-colors">
              Contactanos <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
          <div className="md:w-1/2 h-48 rounded-2xl overflow-hidden relative">
             <img src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=800&auto=format&fit=crop" alt="Trabajos" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}