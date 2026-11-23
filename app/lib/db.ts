// Conexión a la base (Postgres en Neon). Solo se usa en el servidor.
//
// Se configura con DATABASE_URL. Las tablas se crean y actualizan solas la primera
// vez que se usa la conexión, así no hay un paso manual de instalación ni de migración.

import { neon, type NeonQueryFunction } from '@neondatabase/serverless';
import { categoriasIniciales, productosIniciales } from './semilla';

export const hayBase = () => Boolean(process.env.DATABASE_URL);

let tablasListas: Promise<void> | null = null;

// Crea o actualiza las tablas. Cada sentencia se puede repetir sin romper nada, así
// no hay un paso manual de instalación ni de migración.
async function prepararTablas(sql: NeonQueryFunction<false, false>) {
  await sql`
    create table if not exists pedidos (
      id serial primary key,
      creado_en timestamptz not null default now(),
      estado text not null default 'pendiente',
      nombre text not null,
      telefono text not null,
      direccion text not null default '',
      entrega text not null,
      metodo_pago text not null,
      items jsonb not null,
      subtotal integer not null,
      envio integer not null,
      total integer not null,
      mp_pago_id text,
      mp_estado text
    )`;
  await sql`
    create table if not exists clientes (
      id serial primary key,
      creado_en timestamptz not null default now(),
      email text not null unique,
      clave_hash text not null,
      nombre text not null default '',
      telefono text not null default '',
      direccion text not null default ''
    )`;
  // De cada sesión se guarda solo el hash del token: quien lea la base no puede entrar con eso.
  await sql`
    create table if not exists sesiones (
      token_hash text primary key,
      cliente_id integer not null references clientes(id) on delete cascade,
      vence timestamptz not null
    )`;
  await sql`alter table pedidos add column if not exists email text not null default ''`;
  await sql`alter table pedidos add column if not exists cliente_id integer references clientes(id) on delete set null`;
  await sql`create index if not exists pedidos_cliente_id on pedidos (cliente_id)`;

  // Catálogo editable desde /admin. Las fotos se guardan como lista de direcciones
  // (la primera es la principal); los archivos viven en Vercel Blob.
  await sql`
    create table if not exists categorias (
      slug text primary key,
      nombre text not null,
      descripcion text not null default '',
      img text,
      orden integer not null default 0
    )`;
  await sql`
    create table if not exists productos (
      id text primary key,
      creado_en timestamptz not null default now(),
      categoria text not null references categorias(slug) on update cascade,
      nombre text not null,
      precio integer,
      desde boolean not null default false,
      detalle text not null default '',
      descripcion text not null default '',
      imagenes jsonb not null default '[]'::jsonb,
      vertical boolean not null default false,
      visible boolean not null default true,
      orden integer not null default 0
    )`;

  // Primera vez: se carga el catálogo que antes estaba escrito en el código. Se hace
  // en una sola transacción para no quedar con categorías sin productos si algo falla.
  const [{ cantidad }] = await sql`select count(*)::int as cantidad from categorias`;
  if (cantidad === 0) {
    await sql.transaction([
      ...categoriasIniciales.map(
        (c, i) => sql`
          insert into categorias (slug, nombre, descripcion, img, orden)
          values (${c.slug}, ${c.nombre}, ${c.descripcion}, ${c.img ?? null}, ${i})
          on conflict (slug) do nothing`
      ),
      ...productosIniciales.map(
        (p, i) => sql`
          insert into productos (id, categoria, nombre, precio, desde, detalle, imagenes, vertical, orden)
          values (${p.id}, ${p.categoria}, ${p.nombre}, ${p.precio}, ${Boolean(p.desde)}, ${p.detalle},
                  ${JSON.stringify(p.imagenes)}::jsonb, ${Boolean(p.vertical)}, ${i})
          on conflict (id) do nothing`
      ),
    ]);
  }
}

// Devuelve la conexión, preparando las tablas la primera vez. Sin DATABASE_URL devuelve null.
export async function base() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  const sql = neon(url);
  tablasListas ??= prepararTablas(sql);
  try {
    await tablasListas;
  } catch (e) {
    tablasListas = null; // que el próximo intento vuelva a probar
    throw e;
  }
  return sql;
}
