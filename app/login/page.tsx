import type { Metadata } from 'next';
import PageHeader from '../components/PageHeader';
import EnConstruccion from '../components/EnConstruccion';

export const metadata: Metadata = { title: 'Mi cuenta' };

// TODO: falta definir el sistema de cuentas (por ejemplo Supabase Auth) antes de armar el formulario.
export default function LoginPage() {
  return (
    <main className="bg-fondo w-full">
      <PageHeader titulo="Mi cuenta" />
      <EnConstruccion texto="Las cuentas de usuario todavía no están disponibles. Mientras tanto, cualquier consulta la vemos por contacto." />
    </main>
  );
}
