'use server';

// Cambios al catálogo desde el panel. Cada acción:
// 1. revisa que haya sesión de administrador (sin eso no hace nada),
// 2. valida los datos en el servidor (lo del navegador no se da por bueno),
// 3. guarda en la base y borra la caché del catálogo, así la web muestra el cambio enseguida.

import { updateTag } from 'next/cache';
import { esAdmin } from '../lib/admin';
import { base } from '../lib/db';
import { ETIQUETA_CATALOGO, leerCatalogo, type Catalogo, type Categoria, type Producto } from '../lib/catalogo';
import { borrarFotos, fotoValida, puedeSubirFotos } from '../lib/fotos';

type Resultado<T = object> = ({ ok: true } & T) | { ok: false; error: string; sesion?: false };

const SIN_SESION = { ok: false as const, error: 'Tu sesión venció. Volvé a entrar al panel.', sesion: false as const };
const SIN_BASE = { ok: false as const, error: 'Falta configurar DATABASE_URL en el servidor.' };
const MAXIMO_FOTOS = 12;

const texto = (valor: unknown, maximo: number) => (typeof valor === 'string' ? valor.trim().slice(0, maximo) : '');

// "Taza mágica 11 oz" -> "taza-magica-11-oz". Es la parte de la dirección de la página.
function aSlug(nombre: string) {
  return (
    nombre
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'producto'
  );
}

function slugLibre(base: string, usados: Set<string>) {
  let slug = base;
  for (let n = 2; usados.has(slug); n++) slug = `${base}-${n}`;
  return slug;
}

async function preparar() {
  if (!(await esAdmin())) return { error: SIN_SESION };
  const sql = await base();
  if (!sql) return { error: SIN_BASE };
  return { sql };
}

function fallo(e: unknown, que: string): Resultado {
  console.error(`No se pudo ${que}:`, e);
  return { ok: false, error: `No se pudo ${que}. Probá de nuevo en un momento.` };
}

// --- Lectura ---

export async function cargarCatalogo(): Promise<Resultado<{ catalogo: Catalogo; fotos: boolean }>> {
  if (!(await esAdmin())) return SIN_SESION;
  try {
    return { ok: true, catalogo: await leerCatalogo(), fotos: puedeSubirFotos() };
  } catch (e) {
    return fallo(e, 'cargar el catálogo') as Resultado<{ catalogo: Catalogo; fotos: boolean }>;
  }
}

// --- Productos ---

export interface DatosProducto {
  id?: string; // vacío = producto nuevo
  nombre: string;
  categoria: string;
  precio: number | null;
  desde: boolean;
  detalle: string;
  descripcion: string;
  imagenes: string[];
  vertical: boolean;
  visible: boolean;
}

export async function guardarProducto(datos: DatosProducto): Promise<Resultado<{ producto: Producto }>> {
  const { sql, error } = await preparar();
  if (error) return error;

  const nombre = texto(datos?.nombre, 120);
  if (nombre.length < 2) return { ok: false, error: 'Escribí el nombre del producto.' };

  const precio = datos?.precio;
  if (precio !== null && (!Number.isInteger(precio) || precio < 1 || precio > 10_000_000)) {
    return { ok: false, error: 'El precio tiene que ser un número entero de pesos, o vacío si se cotiza.' };
  }

  const imagenes = Array.isArray(datos?.imagenes) ? datos.imagenes : [];
  if (imagenes.length > MAXIMO_FOTOS) return { ok: false, error: `Máximo ${MAXIMO_FOTOS} fotos por producto.` };
  if (!imagenes.every(fotoValida)) return { ok: false, error: 'Hay una foto que no es válida. Quitala y volvé a subirla.' };
  if (new Set(imagenes).size !== imagenes.length) return { ok: false, error: 'Hay una foto repetida.' };

  const valores = {
    nombre,
    categoria: texto(datos?.categoria, 80),
    precio: precio as number | null,
    desde: precio !== null && Boolean(datos?.desde),
    detalle: texto(datos?.detalle, 200),
    descripcion: texto(datos?.descripcion, 4000),
    imagenes: imagenes as string[],
    vertical: Boolean(datos?.vertical),
    visible: datos?.visible !== false,
  };

  try {
    const [categoria] = await sql`select slug from categorias where slug = ${valores.categoria}`;
    if (!categoria) return { ok: false, error: 'Elegí una categoría.' };

    const fotos = JSON.stringify(valores.imagenes);
    let fila;
    let fotosViejas: string[] = [];

    if (datos?.id) {
      const [anterior] = await sql`select imagenes from productos where id = ${datos.id}`;
      if (!anterior) return { ok: false, error: 'Ese producto ya no existe. Recargá el panel.' };
      fotosViejas = anterior.imagenes ?? [];
      [fila] = await sql`
        update productos set
          nombre = ${valores.nombre}, categoria = ${valores.categoria}, precio = ${valores.precio},
          desde = ${valores.desde}, detalle = ${valores.detalle}, descripcion = ${valores.descripcion},
          imagenes = ${fotos}::jsonb, vertical = ${valores.vertical}, visible = ${valores.visible}
        where id = ${datos.id}
        returning *`;
    } else {
      const usados = new Set((await sql`select id from productos`).map((f) => f.id as string));
      const id = slugLibre(aSlug(valores.nombre), usados);
      [fila] = await sql`
        insert into productos (id, categoria, nombre, precio, desde, detalle, descripcion, imagenes, vertical, visible, orden)
        values (${id}, ${valores.categoria}, ${valores.nombre}, ${valores.precio}, ${valores.desde}, ${valores.detalle},
                ${valores.descripcion}, ${fotos}::jsonb, ${valores.vertical}, ${valores.visible},
                (select coalesce(max(orden), 0) + 1 from productos))
        returning *`;
    }

    updateTag(ETIQUETA_CATALOGO);
    await borrarFotos(fotosViejas.filter((u) => !valores.imagenes.includes(u)));
    return { ok: true, producto: { ...valores, id: fila.id } };
  } catch (e) {
    return fallo(e, 'guardar el producto') as Resultado<{ producto: Producto }>;
  }
}

export async function borrarProducto(id: string): Promise<Resultado> {
  const { sql, error } = await preparar();
  if (error) return error;
  try {
    const [fila] = await sql`delete from productos where id = ${id} returning imagenes`;
    updateTag(ETIQUETA_CATALOGO);
    if (fila) await borrarFotos(fila.imagenes ?? []);
    return { ok: true };
  } catch (e) {
    return fallo(e, 'borrar el producto');
  }
}

// Sube o baja un producto un lugar dentro de su categoría (el orden en que se ve en la web).
export async function moverProducto(id: string, direccion: 'arriba' | 'abajo'): Promise<Resultado> {
  const { sql, error } = await preparar();
  if (error) return error;
  try {
    const [actual] = await sql`select categoria from productos where id = ${id}`;
    if (!actual) return { ok: false, error: 'Ese producto ya no existe. Recargá el panel.' };
    const lista = (await sql`select id from productos where categoria = ${actual.categoria} order by orden, creado_en`).map(
      (f) => f.id as string
    );
    const i = lista.indexOf(id);
    const j = direccion === 'arriba' ? i - 1 : i + 1;
    if (j < 0 || j >= lista.length) return { ok: true };
    [lista[i], lista[j]] = [lista[j], lista[i]];
    // Se renumera toda la categoría: así el orden queda prolijo aunque viniera con empates.
    await sql.transaction(lista.map((pid, n) => sql`update productos set orden = ${n} where id = ${pid}`));
    updateTag(ETIQUETA_CATALOGO);
    return { ok: true };
  } catch (e) {
    return fallo(e, 'cambiar el orden');
  }
}

// --- Categorías ---

export interface DatosCategoria {
  slug?: string; // vacío = categoría nueva
  nombre: string;
  descripcion: string;
  img: string | null;
}

export async function guardarCategoria(datos: DatosCategoria): Promise<Resultado<{ categoria: Categoria }>> {
  const { sql, error } = await preparar();
  if (error) return error;

  const nombre = texto(datos?.nombre, 80);
  if (nombre.length < 2) return { ok: false, error: 'Escribí el nombre de la categoría.' };
  const descripcion = texto(datos?.descripcion, 300);
  const img = datos?.img ? datos.img : null;
  if (img !== null && !fotoValida(img)) return { ok: false, error: 'La foto de la categoría no es válida.' };

  try {
    let slug = datos?.slug;
    let fotoVieja: string | null = null;
    if (slug) {
      const [anterior] = await sql`select img from categorias where slug = ${slug}`;
      if (!anterior) return { ok: false, error: 'Esa categoría ya no existe. Recargá el panel.' };
      fotoVieja = anterior.img;
      // El slug (la dirección /lab/...) no cambia al renombrar, para no romper enlaces ya compartidos.
      await sql`update categorias set nombre = ${nombre}, descripcion = ${descripcion}, img = ${img} where slug = ${slug}`;
    } else {
      const usados = new Set((await sql`select slug from categorias`).map((f) => f.slug as string));
      slug = slugLibre(aSlug(nombre), usados);
      await sql`
        insert into categorias (slug, nombre, descripcion, img, orden)
        values (${slug}, ${nombre}, ${descripcion}, ${img}, (select coalesce(max(orden), 0) + 1 from categorias))`;
    }
    updateTag(ETIQUETA_CATALOGO);
    if (fotoVieja && fotoVieja !== img) await borrarFotos([fotoVieja]);
    return { ok: true, categoria: { slug, nombre, descripcion, ...(img ? { img } : {}) } };
  } catch (e) {
    return fallo(e, 'guardar la categoría') as Resultado<{ categoria: Categoria }>;
  }
}

export async function borrarCategoria(slug: string): Promise<Resultado> {
  const { sql, error } = await preparar();
  if (error) return error;
  try {
    const [{ cantidad }] = await sql`select count(*)::int as cantidad from productos where categoria = ${slug}`;
    if (cantidad > 0) {
      return { ok: false, error: `Esa categoría tiene ${cantidad} producto(s). Movelos a otra o borralos primero.` };
    }
    const [fila] = await sql`delete from categorias where slug = ${slug} returning img`;
    updateTag(ETIQUETA_CATALOGO);
    if (fila?.img) await borrarFotos([fila.img]);
    return { ok: true };
  } catch (e) {
    return fallo(e, 'borrar la categoría');
  }
}

// Sube o baja una categoría un lugar (el orden del menú de categorías).
export async function moverCategoria(slug: string, direccion: 'arriba' | 'abajo'): Promise<Resultado> {
  const { sql, error } = await preparar();
  if (error) return error;
  try {
    const lista = (await sql`select slug from categorias order by orden, nombre`).map((f) => f.slug as string);
    const i = lista.indexOf(slug);
    const j = direccion === 'arriba' ? i - 1 : i + 1;
    if (i < 0 || j < 0 || j >= lista.length) return { ok: true };
    [lista[i], lista[j]] = [lista[j], lista[i]];
    await sql.transaction(lista.map((s, n) => sql`update categorias set orden = ${n} where slug = ${s}`));
    updateTag(ETIQUETA_CATALOGO);
    return { ok: true };
  } catch (e) {
    return fallo(e, 'cambiar el orden');
  }
}
