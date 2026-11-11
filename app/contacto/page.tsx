import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import ContactForm from './ContactForm';
import Redes from '../components/Redes';
import { sitio } from '../lib/sitio';

export const metadata: Metadata = {
  title: 'Contacto y presupuestos',
  description: 'Contanos tu idea y te pasamos un presupuesto.',
};

export default function ContactoPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Contacto y presupuestos" subtitulo="Personalizá, regalá, compartí. Contanos tu idea y te respondemos por WhatsApp." />
      <section className="max-w-2xl mx-auto px-4 md:px-8 py-12">
        <ContactForm />
        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-1">
            También podés escribirnos a{' '}
            <a href={`mailto:${sitio.email}`} className="font-semibold text-texto hover:text-marca transition-colors">{sitio.email}</a>
          </p>
          <p className="mb-4">WhatsApp: {sitio.telefono}</p>
          <div className="flex justify-center text-gray-500">
            <Redes />
          </div>
        </div>
      </section>
    </main>
  );
}
