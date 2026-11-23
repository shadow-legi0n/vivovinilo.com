// Cargas de fotos y productos hechas por el programador, aplicadas una sola vez.
//
// El catálogo vive en la base y lo editan los dueños desde /admin, así que no se puede
// "pisar" con datos del código. Cada carga se aplica una vez y queda anotada en la tabla
// cargas_aplicadas: si después alguien quita una foto o borra un producto desde el
// panel, no vuelve a aparecer.
//
// Además cada paso es seguro de repetir (no duplica fotos ni productos), por si dos
// servidores arrancan a la vez.

import type { NeonQueryFunction } from '@neondatabase/serverless';

type Paso =
  // Agrega una foto a un producto que ya existe. "principal" la pone primera.
  | { tipo: 'foto'; producto: string; foto: string; principal?: boolean }
  // Crea un producto nuevo si todavía no hay uno con ese id.
  | {
      tipo: 'producto';
      id: string;
      categoria: string;
      nombre: string;
      precio: number | null;
      detalle: string;
      descripcion?: string;
      imagenes: string[];
    };

interface Carga {
  nombre: string; // identificador único; no cambiarlo una vez publicado
  pasos: Paso[];
}

export const cargas: Carga[] = [
  {
    nombre: '2026-11-23-fotos-lote-1',
    pasos: [
      { tipo: 'foto', producto: 'mousepad', foto: '/productos/mousepad-vinilos.jpg', principal: true },
      { tipo: 'foto', producto: 'posavasos-6', foto: '/productos/posavasos-gato.jpg' },
      {
        tipo: 'producto',
        id: 'taza-cancion-qr',
        categoria: 'personalizados',
        nombre: 'Taza con foto y canción',
        precio: null, // TODO: que los dueños pongan el precio desde el panel
        detalle: 'Tu foto, el nombre de la canción y un QR para escucharla',
        descripcion:
          'Taza con una foto, el nombre de la canción y un código QR. Al escanearlo con el celular se abre la canción.\n\nNos pasás la foto y la canción y armamos el diseño.',
        imagenes: ['/productos/taza-cancion-qr.jpg'],
      },
    ],
  },
];

export async function aplicarCargas(sql: NeonQueryFunction<false, false>) {
  await sql`
    create table if not exists cargas_aplicadas (
      nombre text primary key,
      aplicada_en timestamptz not null default now()
    )`;
  const hechas = new Set((await sql`select nombre from cargas_aplicadas`).map((f) => f.nombre as string));

  for (const carga of cargas) {
    if (hechas.has(carga.nombre)) continue;
    const consultas = carga.pasos.map((paso) => {
      if (paso.tipo === 'foto') {
        const foto = JSON.stringify([paso.foto]);
        return paso.principal
          ? sql`update productos set imagenes = ${foto}::jsonb || imagenes where id = ${paso.producto} and not imagenes @> ${foto}::jsonb`
          : sql`update productos set imagenes = imagenes || ${foto}::jsonb where id = ${paso.producto} and not imagenes @> ${foto}::jsonb`;
      }
      return sql`
        insert into productos (id, categoria, nombre, precio, detalle, descripcion, imagenes, orden)
        select ${paso.id}, ${paso.categoria}, ${paso.nombre}, ${paso.precio}, ${paso.detalle}, ${paso.descripcion ?? ''},
               ${JSON.stringify(paso.imagenes)}::jsonb, (select coalesce(max(orden), 0) + 1 from productos)
        where exists (select 1 from categorias where slug = ${paso.categoria})
        on conflict (id) do nothing`;
    });
    // Todo o nada: la carga queda anotada solo si todos sus pasos se aplicaron.
    await sql.transaction([...consultas, sql`insert into cargas_aplicadas (nombre) values (${carga.nombre}) on conflict do nothing`]);
  }
}
