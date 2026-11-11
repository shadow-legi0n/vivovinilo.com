import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import EnConstruccion from '../components/EnConstruccion';

export const metadata: Metadata = { title: 'Términos y condiciones' };

// TODO: pegar acá el texto legal real.
export default function TerminosPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Términos y condiciones" />
      <EnConstruccion texto="Estamos redactando los términos y condiciones. Si tenés dudas sobre una compra, escribinos." />
    </main>
  );
}
