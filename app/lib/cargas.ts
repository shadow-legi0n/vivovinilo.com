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
  // Pone foto a una categoría, solo si todavía no tiene (no pisa una elegida en el panel).
  | { tipo: 'categoria-foto'; categoria: string; foto: string }
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
      vertical?: boolean; // la foto principal es vertical
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
  {
    nombre: '2026-11-23-fotos-lote-2',
    pasos: [
      // Remeras: blancas (poliéster) y de color (algodón)
      { tipo: 'foto', producto: 'remera-blanca', foto: '/productos/remera-candombe.jpg', principal: true },
      { tipo: 'foto', producto: 'remera-blanca', foto: '/productos/remera-rock-uruguayo.jpg', principal: true },
      { tipo: 'foto', producto: 'remera-color-frente', foto: '/productos/remera-carnaval-montevideo.jpg' },
      { tipo: 'foto', producto: 'remera-color-frente', foto: '/productos/remera-las-llamadas.jpg' },
      { tipo: 'foto', producto: 'remera-color-frente', foto: '/productos/remera-uruguay.jpg' },
      // Chapas
      { tipo: 'foto', producto: 'chapa-a5', foto: '/productos/chapas-spinetta-almendra.jpg' },
      // Taza "Nuestra canción": segunda foto del producto del lote 1
      { tipo: 'foto', producto: 'taza-cancion-qr', foto: '/productos/taza-nuestra-cancion.jpg' },
      {
        tipo: 'producto',
        id: 'placa-cancion-qr',
        categoria: 'personalizados',
        nombre: 'Placa acrílica con foto y canción',
        precio: null, // TODO: que los dueños pongan el precio desde el panel
        detalle: 'Acrílico con base de madera grabada con sus nombres',
        descripcion:
          'Placa de acrílico con una foto, el nombre de la canción y un código QR para escucharla. La base de madera va grabada con los nombres.\n\nNos pasás la foto, la canción y los nombres y armamos el diseño.',
        imagenes: ['/productos/placa-cancion-qr.jpg'],
      },
      {
        tipo: 'producto',
        id: 'taza-vinilo-adhesivo',
        categoria: 'vinilo-dtf',
        nombre: 'Taza con diseño en vinilo adhesivo',
        precio: null, // TODO: que los dueños pongan el precio desde el panel
        detalle: 'Taza blanca con el diseño que elijas en vinilo',
        imagenes: ['/productos/taza-vinilo-supernatural.jpg'],
        vertical: true,
      },
      { tipo: 'categoria-foto', categoria: 'vinilo-dtf', foto: '/productos/taza-vinilo-supernatural.jpg' },
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
      if (paso.tipo === 'categoria-foto') {
        return sql`update categorias set img = ${paso.foto} where slug = ${paso.categoria} and img is null`;
      }
      if (paso.tipo === 'foto') {
        const foto = JSON.stringify([paso.foto]);
        return paso.principal
          ? sql`update productos set imagenes = ${foto}::jsonb || imagenes where id = ${paso.producto} and not imagenes @> ${foto}::jsonb`
          : sql`update productos set imagenes = imagenes || ${foto}::jsonb where id = ${paso.producto} and not imagenes @> ${foto}::jsonb`;
      }
      return sql`
        insert into productos (id, categoria, nombre, precio, detalle, descripcion, imagenes, vertical, orden)
        select ${paso.id}, ${paso.categoria}, ${paso.nombre}, ${paso.precio}, ${paso.detalle}, ${paso.descripcion ?? ''},
               ${JSON.stringify(paso.imagenes)}::jsonb, ${Boolean(paso.vertical)}, (select coalesce(max(orden), 0) + 1 from productos)
        where exists (select 1 from categorias where slug = ${paso.categoria})
        on conflict (id) do nothing`;
    });
    // Todo o nada: la carga queda anotada solo si todos sus pasos se aplicaron.
    await sql.transaction([...consultas, sql`insert into cargas_aplicadas (nombre) values (${carga.nombre}) on conflict do nothing`]);
  }
}
