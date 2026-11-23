// Catálogo del LAB. Vive en la base de datos y se edita desde /admin (pestaña Productos).
//
// Las páginas leen el catálogo a través de obtenerCatalogo(), que queda en caché con la
// etiqueta "catalogo". Cada cambio hecho desde el panel borra esa caché, así la web
// muestra lo nuevo en el siguiente pedido sin volver a publicar el sitio.

import { cacheLife, cacheTag } from 'next/cache';
import { base, hayBase } from './db';
import { categoriasIniciales, productosIniciales } from './semilla';

export const ETIQUETA_CATALOGO = 'catalogo';

export interface Categoria {
  slug: string;
  nombre: string;
  descripcion: string;
  img?: string; // sin foto se muestra un recuadro gris
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number | null; // pesos uruguayos; null = se cotiza según diseño
  desde?: boolean; // el precio es "desde $X"
  detalle: string; // línea corta que se ve en la tarjeta
  descripcion: string; // texto largo de la página del producto
  imagenes: string[]; // la primera es la foto principal
  vertical?: boolean; // la foto principal es un afiche vertical
  visible: boolean; // oculto = no se muestra ni se puede comprar
  categoria: string; // slug de la categoría
}

export interface Catalogo {
  categorias: Categoria[];
  productos: Producto[]; // todos, incluidos los ocultos (el panel los necesita)
}

/* eslint-disable @typescript-eslint/no-explicit-any */
const aCategoria = (f: any): Categoria => ({
  slug: f.slug,
  nombre: f.nombre,
  descripcion: f.descripcion,
  ...(f.img ? { img: f.img } : {}),
});

const aProducto = (f: any): Producto => ({
  id: f.id,
  nombre: f.nombre,
  precio: f.precio,
  desde: f.desde,
  detalle: f.detalle,
  descripcion: f.descripcion,
  imagenes: Array.isArray(f.imagenes) ? f.imagenes : [],
  vertical: f.vertical,
  visible: f.visible,
  categoria: f.categoria,
});
/* eslint-enable @typescript-eslint/no-explicit-any */

// Lee el catálogo directo de la base, sin caché. Lo usa el panel para editar sobre datos frescos.
export async function leerCatalogo(): Promise<Catalogo> {
  const sql = await base();
  if (!sql) {
    // Sin base configurada (por ejemplo en una copia local sin .env.local) se muestra el catálogo inicial.
    return {
      categorias: categoriasIniciales,
      productos: productosIniciales.map((p) => ({ ...p, descripcion: '', visible: true })),
    };
  }
  const [categorias, productos] = await Promise.all([
    sql`select * from categorias order by orden, nombre`,
    sql`select * from productos order by orden, creado_en`,
  ]);
  return { categorias: categorias.map(aCategoria), productos: productos.map(aProducto) };
}

// Catálogo para las páginas públicas y para cobrar. Queda en caché hasta que el panel lo cambie.
export async function obtenerCatalogo(): Promise<Catalogo> {
  'use cache';
  cacheTag(ETIQUETA_CATALOGO);
  cacheLife('max');
  return leerCatalogo();
}

// --- Ayudas para las páginas (solo productos visibles) ---

export async function getCategorias() {
  return (await obtenerCatalogo()).categorias;
}

export async function getCategoria(slug: string) {
  return (await obtenerCatalogo()).categorias.find((c) => c.slug === slug);
}

export async function getProductosPorCategoria(slug: string) {
  return (await obtenerCatalogo()).productos.filter((p) => p.visible && p.categoria === slug);
}

export async function getProducto(id: string) {
  return (await obtenerCatalogo()).productos.find((p) => p.visible && p.id === id);
}

export { hayBase };
