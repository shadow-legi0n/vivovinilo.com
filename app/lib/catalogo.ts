// Catálogo del LAB. Por ahora vive en este archivo; cuando haya base de datos,
// alcanza con cambiar las funciones de abajo y las páginas no se enteran.

export interface Categoria {
  slug: string;
  nombre: string;
  descripcion: string;
  img: string;
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number; // en pesos uruguayos
  detalle: string;
  imagen: string;
  categoria: string; // slug de la categoría
}

const foto = (id: string, ancho = 400) =>
  `https://images.unsplash.com/${id}?q=80&w=${ancho}&auto=format&fit=crop`;

export const categorias: Categoria[] = [
  { slug: 'sublimacion', nombre: 'Sublimación', descripcion: 'Estampado a todo color sobre distintos materiales.', img: foto('photo-1514228742587-6b1558fcca3d') },
  { slug: 'tazas-termos-mates', nombre: 'Tazas, termos y mates', descripcion: 'Para el día a día, con tu diseño.', img: foto('photo-1517254456976-ee8f02088d43') },
  { slug: 'indumentaria', nombre: 'Indumentaria', descripcion: 'Remeras y prendas estampadas.', img: foto('photo-1521572163474-6864f9cf17ab') },
  { slug: 'vinilo-dtf', nombre: 'Vinilo y DTF', descripcion: 'Vinilos de corte y transfers DTF.', img: foto('photo-1620012253295-c15bc3e6554c') },
  { slug: 'impresion-3d', nombre: 'Impresión 3D', descripcion: 'Piezas y objetos impresos a medida.', img: foto('photo-1615962122149-a417df85dc74') },
  { slug: 'regalos-souvenirs', nombre: 'Regalos y souvenirs', descripcion: 'Detalles para regalar o repartir.', img: foto('photo-1549465220-1a8b9238cd48') },
  { slug: 'personalizados', nombre: 'Personalizados', descripcion: 'Productos hechos con tu nombre, foto o frase.', img: foto('photo-1583337130417-3346a1be7dee') },
  { slug: 'disenos-especiales', nombre: 'Diseños especiales', descripcion: 'Proyectos únicos, a pedido.', img: foto('photo-1561016444-14fd547ea40f') },
];

// PRODUCTOS DE EJEMPLO: son los mismos de la demo del carrito. Reemplazar por los reales.
export const productos: Producto[] = [
  {
    id: 'taza-vinilo-1',
    nombre: 'Taza Personalizada + Código QR Musical',
    precio: 450,
    detalle: 'Diseño personalizado a elección',
    imagen: foto('photo-1514228742587-6b1558fcca3d', 300),
    categoria: 'tazas-termos-mates',
  },
  {
    id: 'termo-perso-2',
    nombre: 'Termo Acero Inoxidable Grabado',
    precio: 1450,
    detalle: 'Grabado láser personalizado',
    imagen: foto('photo-1517254456976-ee8f02088d43', 300),
    categoria: 'tazas-termos-mates',
  },
  {
    id: 'remera-dtf-3',
    nombre: 'Remera Algodón Premium Estampa DTF',
    precio: 890,
    detalle: 'Talle L - Negro',
    imagen: foto('photo-1521572163474-6864f9cf17ab', 300),
    categoria: 'indumentaria',
  },
];

export function getCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug);
}

export function getProductosPorCategoria(slug: string) {
  return productos.filter((p) => p.categoria === slug);
}
