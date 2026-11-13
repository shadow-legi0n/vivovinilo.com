import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import Cuenta from '../cuenta/Cuenta';

export const metadata: Metadata = { title: 'Iniciar sesión' };

// Misma pantalla que /cuenta: muestra el formulario de ingreso o, con sesión abierta, la cuenta.
export default function LoginPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Mi cuenta" subtitulo="Tus datos y el estado de tus pedidos." />
      <Cuenta />
    </main>
  );
}
