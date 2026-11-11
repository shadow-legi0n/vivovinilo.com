import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import ContactForm from './ContactForm';

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
      </section>
    </main>
  );
}
