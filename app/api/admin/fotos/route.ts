import { esAdmin } from '../../../lib/admin';
import { guardarFoto, MAXIMO_FOTO, puedeSubirFotos, TIPOS_FOTO } from '../../../lib/fotos';

const error = (mensaje: string, status: number) => Response.json({ error: mensaje }, { status });

// Sube una foto desde el panel. Devuelve la dirección; la foto recién queda en el
// producto cuando se toca "Guardar".
export async function POST(request: Request) {
  if (!(await esAdmin())) return error('Tu sesión venció. Volvé a entrar al panel.', 401);
  if (!puedeSubirFotos()) {
    return error('Falta conectar el almacenamiento de fotos (Vercel Blob) al proyecto.', 503);
  }

  const datos = await request.formData().catch(() => null);
  const archivo = datos?.get('foto');
  if (!(archivo instanceof File)) return error('No llegó ninguna foto.', 400);
  if (!(archivo.type in TIPOS_FOTO)) return error('La foto tiene que ser JPG, PNG o WEBP.', 400);
  if (archivo.size > MAXIMO_FOTO) return error('La foto es demasiado pesada (máximo 4 MB).', 400);

  try {
    return Response.json({ url: await guardarFoto(archivo) });
  } catch (e) {
    console.error('No se pudo guardar la foto:', e);
    return error('No pudimos guardar la foto. Probá de nuevo.', 502);
  }
}
