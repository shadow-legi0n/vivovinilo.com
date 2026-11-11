import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import EnConstruccion from '../components/EnConstruccion';

export const metadata: Metadata = { title: 'Política de privacidad' };

// TODO: pegar acá el texto legal real.
export default function PrivacidadPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Política de privacidad" />
      <EnConstruccion texto="Estamos redactando la política de privacidad. Si tenés dudas sobre tus datos, escribinos." />
    </main>
  );
}
