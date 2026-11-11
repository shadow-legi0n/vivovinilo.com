// Catálogo del LAB. Por ahora vive en este archivo; cuando haya base de datos,
// alcanza con cambiar las funciones de abajo y las páginas no se enteran.

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
  detalle: string;
  imagen?: string;
  vertical?: boolean; // la foto es un afiche vertical
  categoria: string; // slug de la categoría
}

const unsplash = (id: string) => `https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`;
const foto = (nombre: string) => `/productos/${nombre}.jpg`; // archivos en public/productos

export const categorias: Categoria[] = [
  { slug: 'sublimacion', nombre: 'Sublimación', descripcion: 'Estampado a todo color sobre distintos materiales.', img: unsplash('photo-1514228742587-6b1558fcca3d') },
  { slug: 'tazas-termos-mates', nombre: 'Tazas, termos y mates', descripcion: 'Para el día a día, con tu diseño.', img: foto('tazas-disenos') },
  { slug: 'indumentaria', nombre: 'Indumentaria', descripcion: 'Remeras y prendas estampadas.', img: unsplash('photo-1521572163474-6864f9cf17ab') },
  { slug: 'vinilo-dtf', nombre: 'Vinilo y DTF', descripcion: 'Vinilos de corte y transfers DTF.' }, // TODO: falta foto
  { slug: 'impresion-3d', nombre: 'Impresión 3D', descripcion: 'Piezas y objetos impresos a medida.', img: foto('3d-lamparas-floreros') },
  { slug: 'regalos-souvenirs', nombre: 'Regalos y souvenirs', descripcion: 'Detalles para regalar o repartir.', img: foto('bolsas') },
  { slug: 'personalizados', nombre: 'Personalizados', descripcion: 'Productos hechos con tu nombre, foto o frase.', img: foto('tazas-interior-color') },
  { slug: 'disenos-especiales', nombre: 'Diseños especiales', descripcion: 'Proyectos únicos, a pedido.', img: foto('tazas-metalizadas') },
];

// Precios de la lista de prueba de Vivo Vinilo Lab.
export const productos: Producto[] = [
  // Tazas, termos y mates
  { id: 'taza', nombre: 'Taza personalizada', precio: 290, desde: true, detalle: 'Blanca, de color, con interior de color o mágica', imagen: foto('tazas-modelos'), categoria: 'tazas-termos-mates' },
  { id: 'termo-500', nombre: 'Termo de 500 ml', precio: 590, detalle: 'Con tu diseño', imagen: foto('termos-cantimploras'), categoria: 'tazas-termos-mates' },
  { id: 'cantimplora-600', nombre: 'Cantimplora de 600 ml', precio: 350, detalle: 'Con tu diseño', imagen: foto('termos-cantimploras'), categoria: 'tazas-termos-mates' },

  // Indumentaria
  { id: 'remera-blanca', nombre: 'Remera blanca', precio: 490, detalle: 'Poliéster, estampada', imagen: unsplash('photo-1521572163474-6864f9cf17ab'), categoria: 'indumentaria' },
  { id: 'remera-color-frente', nombre: 'Remera de color', precio: 650, detalle: 'Algodón, estampado al frente', categoria: 'indumentaria' },
  { id: 'remera-color-frente-espalda', nombre: 'Remera de color, frente y espalda', precio: 800, detalle: 'Algodón, estampado frente y espalda', categoria: 'indumentaria' },

  // Sublimación
  { id: 'mousepad', nombre: 'Mouse pad', precio: 180, detalle: 'Con tu diseño', imagen: foto('mousepad'), categoria: 'sublimacion' },
  { id: 'azulejo-15x20', nombre: 'Azulejo 15 × 20 cm', precio: 249, detalle: 'Sublimado', categoria: 'sublimacion' },
  { id: 'chapa-a5', nombre: 'Chapa sublimable', precio: 250, detalle: 'Tamaño A5', categoria: 'sublimacion' },
  { id: 'posavasos-6', nombre: 'Posavasos', precio: 350, detalle: 'Juego de 6', categoria: 'sublimacion' },

  // Regalos y souvenirs
  { id: 'agenda', nombre: 'Agenda', precio: 490, detalle: 'Tapa personalizada', imagen: foto('agendas'), categoria: 'regalos-souvenirs' },
  { id: 'bolsa-tnt', nombre: 'Bolsa TNT', precio: 180, detalle: 'Estampada', imagen: foto('bolsas'), categoria: 'regalos-souvenirs' },
  { id: 'bolsa-ecologica', nombre: 'Bolsa ecológica', precio: 450, detalle: 'Estampada', imagen: foto('bolsas'), categoria: 'regalos-souvenirs' },

  // Impresión 3D: todo se cotiza
  { id: '3d-deco', nombre: 'Deco 3D: lámparas y floreros', precio: null, detalle: 'Según diseño', imagen: foto('3d-lamparas-floreros'), vertical: true, categoria: 'impresion-3d' },
  { id: '3d-organizadores', nombre: 'Deco 3D: organizadores y cajoncitos', precio: null, detalle: 'Según diseño', imagen: foto('3d-organizadores'), vertical: true, categoria: 'impresion-3d' },
  { id: '3d-ideas-utiles', nombre: 'Ideas útiles 3D', precio: null, detalle: 'Pequeñas soluciones para casa', imagen: foto('3d-ideas-utiles-casa'), vertical: true, categoria: 'impresion-3d' },
  { id: '3d-kit-sensorial', nombre: 'Kit sensorial 3D', precio: null, detalle: 'Texturas, formas y exploración', imagen: foto('3d-kit-sensorial'), vertical: true, categoria: 'impresion-3d' },
  { id: '3d-merchandising', nombre: 'Merchandising 3D', precio: null, detalle: 'Llaveros y detalles para tu marca', imagen: foto('3d-merchandising-llaveros'), vertical: true, categoria: 'impresion-3d' },
];

export function getCategoria(slug: string) {
  return categorias.find((c) => c.slug === slug);
}

export function getProductosPorCategoria(slug: string) {
  return productos.filter((p) => p.categoria === slug);
}
