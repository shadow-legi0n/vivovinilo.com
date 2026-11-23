// Buscador del sitio. Todo lo que se puede encontrar se arma acá a partir del
// catálogo y del menú, así un producto cargado desde el panel aparece en la búsqueda
// sin tocar nada más. El índice lo arma el servidor (/api/busqueda) y la búsqueda
// corre en el navegador.

import type { Catalogo } from './catalogo';
import { navegacion } from './sitio';

export interface Resultado {
  tipo: 'Producto' | 'Categoría' | 'Servicio' | 'Página';
  titulo: string;
  detalle: string;
  href: string;
  imagen?: string;
}

export interface Entrada extends Resultado {
  claves: string; // palabras extra por las que también se encuentra
}

// Otras formas de decir lo mismo, para que "camiseta" encuentre las remeras.
const sinonimos: Record<string, string> = {
  taza: 'tazas mug jarro café mate desayuno',
  'termo-500': 'termos mate botella acero',
  'cantimplora-600': 'cantimploras botella agua deporte',
  'remera-blanca': 'remeras camiseta camisetas ropa indumentaria',
  'remera-color-frente': 'remeras camiseta camisetas ropa indumentaria',
  'remera-color-frente-espalda': 'remeras camiseta camisetas ropa indumentaria',
  mousepad: 'mouse pad alfombrilla oficina computadora',
  'azulejo-15x20': 'azulejos cerámica cuadro foto',
  'chapa-a5': 'chapas cartel metal cuadro',
  'posavasos-6': 'posa vasos apoyavasos',
  agenda: 'agendas cuaderno libreta',
  'bolsa-tnt': 'bolsas souvenir evento',
  'bolsa-ecologica': 'bolsas tote tela lienzo',
  '3d-deco': 'lámpara florero decoración hogar impresión',
  '3d-organizadores': 'organizador escritorio cajones impresión',
  '3d-ideas-utiles': 'cocina gancho hogar impresión',
  '3d-kit-sensorial': 'niños juguetes didáctico impresión',
  '3d-merchandising': 'llavero llaveros empresa marca impresión',
};

export function armarEntradas({ categorias, productos }: Catalogo): Entrada[] {
  return [
  ...productos.filter((p) => p.visible).map((p) => {
    const categoria = categorias.find((c) => c.slug === p.categoria);
    return {
      tipo: 'Producto' as const,
      titulo: p.nombre,
      detalle: p.precio === null ? 'Precio a cotizar' : `${p.desde ? 'Desde ' : ''}$${p.precio}`,
      href: `/lab/${p.categoria}/${p.id}`,
      imagen: p.imagenes[0],
      claves: `${p.detalle} ${p.descripcion} ${categoria?.nombre ?? ''} ${sinonimos[p.id] ?? ''}`,
    };
  }),
  ...categorias.map((c) => ({
    tipo: 'Categoría' as const,
    titulo: c.nombre,
    detalle: c.descripcion,
    href: `/lab/${c.slug}`,
    imagen: c.img,
    claves: 'lab categoría',
  })),
  ...[
    { titulo: 'Streaming', detalle: 'Transmisiones en vivo y eventos', claves: 'vivo transmisión directo' },
    { titulo: 'Podcast', detalle: 'Audio y video, entrevistas y programas', claves: 'programa entrevista radio' },
    { titulo: 'Grabaciones', detalle: 'Voces, música e instrumentos', claves: 'grabar canción estudio música cantar' },
    { titulo: 'Producciones', detalle: 'Contenido musical, audiovisual y para redes', claves: 'jingle video canción personalizada' },
  ].map((s) => ({ ...s, tipo: 'Servicio' as const, href: '/estudio' })),
  ...navegacion
    .filter((n) => n.href !== '/')
    .map((n) => ({ tipo: 'Página' as const, titulo: n.nombre, detalle: '', href: n.href, claves: '' })),
  { tipo: 'Página', titulo: 'Carrito', detalle: 'Tu compra', href: '/carrito', claves: 'pagar compra pedido' },
  ];
}

// Pasa a minúsculas y saca los tildes, para que "sublimacion" encuentre "Sublimación".
const normalizar = (texto: string) =>
  texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export type Indice = ReturnType<typeof armarIndice>;

export function armarIndice(entradas: Entrada[]) {
  return entradas.map((e) => ({
    entrada: e,
    titulo: normalizar(e.titulo),
    todo: normalizar(`${e.titulo} ${e.detalle} ${e.claves} ${e.tipo}`),
  }));
}

// Devuelve lo que contiene todas las palabras buscadas; primero lo que coincide en el título.
export function buscar(indice: Indice, consulta: string, maximo = 8): Resultado[] {
  const palabras = normalizar(consulta).split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [];

  return indice
    .filter((i) => palabras.every((p) => i.todo.includes(p)))
    .map((i) => ({ i, enTitulo: palabras.every((p) => i.titulo.includes(p)) }))
    .sort((a, b) => Number(b.enTitulo) - Number(a.enTitulo))
    .slice(0, maximo)
    .map(({ i }) => {
      const { tipo, titulo, detalle, href, imagen } = i.entrada;
      return { tipo, titulo, detalle, href, imagen };
    });
}
