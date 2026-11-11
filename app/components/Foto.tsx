import { ImageIcon } from 'lucide-react';

// Muestra la foto, o un recuadro gris si el producto o la categoría todavía no tiene.
export default function Foto({ src, alt, className = '' }: { src?: string; alt: string; className?: string }) {
  if (!src) {
    return (
      <div role="img" aria-label={`${alt} (sin foto)`} className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <ImageIcon className="w-8 h-8 text-gray-300" />
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" className={`object-cover ${className}`} />;
}
