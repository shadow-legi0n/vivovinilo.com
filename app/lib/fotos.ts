// Fotos de productos y categorías. Solo se usa en el servidor.
//
// En la web publicada se guardan en Vercel Blob (necesita BLOB_READ_WRITE_TOKEN, que
// Vercel crea solo al conectar el almacenamiento al proyecto). En una copia local sin
// ese token se guardan en public/subidas para poder probar el panel.

import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { del, put } from '@vercel/blob';

export const TIPOS_FOTO: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };
export const MAXIMO_FOTO = 4 * 1024 * 1024; // el navegador achica antes de subir; esto es el tope por seguridad

const hayBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);
export const puedeSubirFotos = () => hayBlob() || process.env.NODE_ENV !== 'production';

// Guarda la foto y devuelve la dirección con la que se muestra en la web.
export async function guardarFoto(archivo: File): Promise<string> {
  const extension = TIPOS_FOTO[archivo.type];
  const nombre = `productos/${randomUUID()}.${extension}`;

  if (hayBlob()) {
    const blob = await put(nombre, archivo, { access: 'public', contentType: archivo.type });
    return blob.url;
  }

  const destino = path.join(process.cwd(), 'public', 'subidas', nombre);
  await mkdir(path.dirname(destino), { recursive: true });
  await writeFile(destino, Buffer.from(await archivo.arrayBuffer()));
  return `/subidas/${nombre}`;
}

// Las direcciones que se aceptan al guardar un producto: fotos subidas por el panel
// o las que ya venían con el sitio. Así nadie puede colar enlaces a otros sitios.
export function fotoValida(url: unknown): url is string {
  if (typeof url !== 'string' || url.length > 500) return false;
  if (/^\/(productos|subidas)\/[\w\-./]+\.(jpe?g|png|webp)$/i.test(url) && !url.includes('..')) return true;
  try {
    const u = new URL(url);
    return u.protocol === 'https:' && (u.hostname.endsWith('.public.blob.vercel-storage.com') || u.hostname === 'images.unsplash.com');
  } catch {
    return false;
  }
}

// Borra del almacenamiento las fotos que ya no usa nadie. Solo toca las subidas a
// Blob: las que vienen con el sitio (public/productos) quedan como están.
export async function borrarFotos(urls: string[]) {
  const deBlob = urls.filter((u) => u.includes('.public.blob.vercel-storage.com'));
  if (deBlob.length === 0 || !hayBlob()) return;
  try {
    await del(deBlob);
  } catch (e) {
    console.error('No se pudieron borrar fotos viejas de Blob:', e); // quedan huérfanas, no rompe nada
  }
}
