import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import Cuenta from './Cuenta';

export const metadata: Metadata = { title: 'Mi cuenta' };

export default function CuentaPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Mi cuenta" subtitulo="Tus datos y el estado de tus pedidos." />
      <Cuenta />
    </main>
  );
}
