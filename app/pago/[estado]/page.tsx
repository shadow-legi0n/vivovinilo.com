import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import DespuesDelPago from './DespuesDelPago';

// Mercado Pago devuelve al cliente a /pago/aprobado, /pago/pendiente o /pago/rechazado.
const estados = {
  aprobado: {
    icono: CheckCircle,
    color: 'text-green-500',
    titulo: '¡Pago aprobado!',
    texto: 'Recibimos tu pago. Escribinos por WhatsApp para coordinar el envío o el retiro.',
  },
  pendiente: {
    icono: Clock,
    color: 'text-amber-500',
    titulo: 'Pago pendiente',
    texto: 'Mercado Pago todavía está procesando el pago. Cuando se acredite te avisamos.',
  },
  rechazado: {
    icono: XCircle,
    color: 'text-red-500',
    titulo: 'No se pudo completar el pago',
    texto: 'No se te cobró nada. Tu carrito sigue guardado: podés intentar de nuevo o elegir otro método de pago.',
  },
};

type Estado = keyof typeof estados;

export const metadata: Metadata = { title: 'Pago' };

// Igual que en las categorías: las tres páginas se generan en el build.
export const instant = false;

export function generateStaticParams() {
  return Object.keys(estados).map((estado) => ({ estado }));
}

export default async function PagoPage({ params }: PageProps<'/pago/[estado]'>) {
  const { estado } = await params;
  if (!Object.hasOwn(estados, estado)) notFound();

  const { icono: Icono, color, titulo, texto } = estados[estado as Estado];

  return (
    <main className="bg-fondo w-full">
      <section className="max-w-2xl mx-auto px-4 md:px-8 py-20">
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center">
          <Icono className={`w-16 h-16 mx-auto mb-4 ${color}`} />
          <h1 className="text-2xl font-bold text-texto mb-2">{titulo}</h1>
          <p className="text-gray-600 mb-8">{texto}</p>
          {estado !== 'rechazado' && <DespuesDelPago aprobado={estado === 'aprobado'} />}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {estado === 'rechazado' && (
              <Link href="/carrito" className="bg-marca hover:bg-marca-hover text-white px-6 py-3 rounded-full font-medium transition-colors">
                Volver al carrito
              </Link>
            )}
            <Link href="/" className="bg-oscuro hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors">
              Ir al inicio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
