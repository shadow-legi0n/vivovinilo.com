import { Mail } from 'lucide-react';
import { linkWhatsApp, sitio } from '../lib/sitio';

// lucide-react ya no trae logos de marcas, así que estos tres están dibujados acá.
type IconoProps = { className?: string };

const trazo = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export function IconoWhatsApp({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...trazo}>
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      <path
        fill="currentColor"
        stroke="none"
        d="M9.2 7.6c.3 0 .5.1.6.5l.6 1.5c.1.3 0 .5-.2.7l-.5.6c.6 1.2 1.6 2.200 2.800 2.800l.6-.5c.2-.2.4-.3.7-.2l1.500.6c.4.100.5.300.5.600 0 1.100-.9 1.800-1.900 1.800-3.500 0-6.500-3-6.500-6.500 0-1 .700-1.900 1.800-1.900Z"
      />
    </svg>
  );
}

export function IconoInstagram({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...trazo}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconoFacebook({ className }: IconoProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
      <path d="M13.5 22v-8.500h2.800l.45-3.300H13.500V8.100c0-.95.300-1.600 1.650-1.600h1.750V3.550C16.600 3.500 15.550 3.400 14.350 3.400c-2.550 0-4.250 1.550-4.250 4.400v2.400H7.300v3.300h2.800V22Z" />
    </svg>
  );
}

const redes = [
  { nombre: 'WhatsApp', href: linkWhatsApp(), Icono: IconoWhatsApp },
  { nombre: 'Instagram', href: sitio.instagram, Icono: IconoInstagram },
  { nombre: 'Facebook', href: sitio.facebook, Icono: IconoFacebook },
  { nombre: 'Mail', href: `mailto:${sitio.email}`, Icono: Mail },
];

// Fila de botones redondos con las redes. Hereda el color del texto de donde se use.
export default function Redes() {
  return (
    <div className="flex gap-4">
      {redes.map(({ nombre, href, Icono }) => (
        <a
          key={nombre}
          href={href}
          aria-label={`${nombre} de Vivo Vinilo`}
          title={nombre}
          {...(href.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className="hover:text-marca transition-colors border border-gray-600 rounded-full p-2 flex items-center justify-center"
        >
          <Icono className="w-5 h-5" />
        </a>
      ))}
    </div>
  );
}
