import type { Metadata } from 'next';
import Panel from './Panel';

// Que los buscadores no listen el panel. La protección real está en las rutas
// /api/admin, que no devuelven nada sin la sesión de administrador.
export const metadata: Metadata = { title: 'Panel', robots: { index: false, follow: false } };

export default function AdminPage() {
  return (
    <main className="bg-fondo w-full min-h-screen">
      <Panel />
    </main>
  );
}
