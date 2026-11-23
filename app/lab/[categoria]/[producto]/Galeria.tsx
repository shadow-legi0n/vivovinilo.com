'use client';

import { useState } from 'react';
import Foto from '../../../components/Foto';

// Foto grande con miniaturas debajo para cambiar entre las fotos del producto.
export default function Galeria({ imagenes, nombre }: { imagenes: string[]; nombre: string }) {
  const [actual, setActual] = useState(0);
  const elegida = imagenes[Math.min(actual, imagenes.length - 1)];

  return (
    <div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <Foto src={elegida} alt={nombre} className="w-full aspect-square !object-contain bg-white" />
      </div>
      {imagenes.length > 1 && (
        <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
          {imagenes.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActual(i)}
              aria-label={`Ver foto ${i + 1} de ${imagenes.length}`}
              aria-current={i === actual}
              className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors cursor-pointer ${
                i === actual ? 'border-marca' : 'border-transparent hover:border-gray-300'
              }`}
            >
              <Foto src={src} alt="" className="w-full h-full" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
