'use client';

import { useId, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import Foto from './Foto';
import { buscar } from '../lib/busqueda';

// Buscador con resultados al instante. Busca en el catálogo que ya viene con la página,
// así que no hace ningún pedido al servidor mientras se escribe.
export default function Buscador({ className = '' }: { className?: string }) {
  const router = useRouter();
  const idLista = useId();
  const [consulta, setConsulta] = useState('');
  const [abierto, setAbierto] = useState(false);
  const [marcado, setMarcado] = useState(0);

  // Los resultados se calculan al dibujar: no hace falta guardarlos en el estado.
  const resultados = buscar(consulta);
  const mostrar = abierto && consulta.trim() !== '';

  const ir = (href: string) => {
    setAbierto(false);
    setConsulta('');
    router.push(href);
  };

  const alTeclear = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setAbierto(false);
    } else if (e.key === 'ArrowDown' && resultados.length > 0) {
      e.preventDefault();
      setMarcado((m) => (m + 1) % resultados.length);
    } else if (e.key === 'ArrowUp' && resultados.length > 0) {
      e.preventDefault();
      setMarcado((m) => (m - 1 + resultados.length) % resultados.length);
    }
  };

  const alEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    const elegido = resultados[marcado] ?? resultados[0];
    if (elegido) ir(elegido.href);
  };

  return (
    <form role="search" onSubmit={alEnviar} className={`relative ${className}`}>
      <input
        type="search"
        role="combobox"
        aria-label="Buscar en Vivo Vinilo"
        aria-expanded={mostrar}
        aria-controls={idLista}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Buscar productos, servicios o ideas..."
        value={consulta}
        onChange={(e) => {
          setConsulta(e.target.value);
          setMarcado(0);
          setAbierto(true);
        }}
        onFocus={() => setAbierto(true)}
        onBlur={() => setAbierto(false)}
        onKeyDown={alTeclear}
        className="w-full bg-zinc-900 text-white rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-marca [&::-webkit-search-cancel-button]:hidden"
      />
      <button type="submit" aria-label="Buscar" className="absolute right-3 top-2.5 text-gray-400 hover:text-white transition-colors cursor-pointer">
        <Search className="w-4 h-4" />
      </button>

      {mostrar && (
        <ul
          id={idLista}
          role="listbox"
          // Evita que el clic le saque el foco al campo y cierre la lista antes de navegar.
          onMouseDown={(e) => e.preventDefault()}
          className="absolute left-0 right-0 top-full mt-2 bg-white text-texto rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 max-h-[70vh] overflow-y-auto"
        >
          {resultados.length === 0 ? (
            <li className="px-4 py-4 text-sm text-gray-500">
              No encontramos nada para &quot;{consulta.trim()}&quot;.{' '}
              <button type="button" onClick={() => ir('/contacto')} className="font-semibold text-marca hover:underline cursor-pointer">
                Contanos tu idea
              </button>
            </li>
          ) : (
            resultados.map((r, i) => (
              <li key={`${r.tipo}-${r.titulo}`} role="option" aria-selected={i === marcado}>
                <button
                  type="button"
                  onClick={() => ir(r.href)}
                  onMouseEnter={() => setMarcado(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer ${i === marcado ? 'bg-gray-100' : ''}`}
                >
                  <Foto src={r.imagen} alt="" className="w-10 h-10 rounded-lg shrink-0" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-semibold truncate">{r.titulo}</span>
                    {r.detalle && <span className="block text-xs text-gray-500 truncate">{r.detalle}</span>}
                  </span>
                  <span className="text-[11px] text-gray-400 shrink-0">{r.tipo}</span>
                </button>
              </li>
            ))
          )}
        </ul>
      )}
    </form>
  );
}
