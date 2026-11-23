// Catálogo con el que arranca la base de datos. Se carga una sola vez, la primera
// vez que la tabla de productos está vacía; después todo se edita desde /admin.

import type { Categoria, Producto } from './catalogo';

type ProductoInicial = Omit<Producto, 'descripcion' | 'visible'>;

const unsplash = (id: string) => `https://images.unsplash.com/${id}?q=80&w=400&auto=format&fit=crop`;
const foto = (nombre: string) => `/productos/${nombre}.jpg`; // archivos en public/productos

export const categoriasIniciales: Categoria[] = [
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
export const productosIniciales: ProductoInicial[] = [
  // Tazas, termos y mates
  { id: 'taza', nombre: 'Taza personalizada', precio: 290, desde: true, detalle: 'Blanca, de color, con interior de color o mágica', imagenes: [foto('tazas-modelos')], categoria: 'tazas-termos-mates' },
  { id: 'termo-500', nombre: 'Termo de 500 ml', precio: 590, detalle: 'Con tu diseño', imagenes: [foto('termos-cantimploras')], categoria: 'tazas-termos-mates' },
  { id: 'cantimplora-600', nombre: 'Cantimplora de 600 ml', precio: 350, detalle: 'Con tu diseño', imagenes: [foto('termos-cantimploras')], categoria: 'tazas-termos-mates' },

  // Indumentaria
  { id: 'remera-blanca', nombre: 'Remera blanca', precio: 490, detalle: 'Poliéster, estampada', imagenes: [unsplash('photo-1521572163474-6864f9cf17ab')], categoria: 'indumentaria' },
  { id: 'remera-color-frente', nombre: 'Remera de color', precio: 650, detalle: 'Algodón, estampado al frente', imagenes: [], categoria: 'indumentaria' },
  { id: 'remera-color-frente-espalda', nombre: 'Remera de color, frente y espalda', precio: 800, detalle: 'Algodón, estampado frente y espalda', imagenes: [], categoria: 'indumentaria' },

  // Sublimación
  { id: 'mousepad', nombre: 'Mouse pad', precio: 180, detalle: 'Con tu diseño', imagenes: [foto('mousepad')], categoria: 'sublimacion' },
  { id: 'azulejo-15x20', nombre: 'Azulejo 15 × 20 cm', precio: 249, detalle: 'Sublimado', imagenes: [], categoria: 'sublimacion' },
  { id: 'chapa-a5', nombre: 'Chapa sublimable', precio: 250, detalle: 'Tamaño A5', imagenes: [], categoria: 'sublimacion' },
  { id: 'posavasos-6', nombre: 'Posavasos', precio: 350, detalle: 'Juego de 6', imagenes: [foto('posavasos-simpsons')], categoria: 'sublimacion' },

  // Regalos y souvenirs
  { id: 'agenda', nombre: 'Agenda', precio: 490, detalle: 'Tapa personalizada', imagenes: [foto('agendas')], categoria: 'regalos-souvenirs' },
  { id: 'bolsa-tnt', nombre: 'Bolsa TNT', precio: 180, detalle: 'Estampada', imagenes: [foto('bolsas')], categoria: 'regalos-souvenirs' },
  { id: 'bolsa-ecologica', nombre: 'Bolsa ecológica', precio: 450, detalle: 'Estampada', imagenes: [foto('bolsas')], categoria: 'regalos-souvenirs' },

  // Impresión 3D: todo se cotiza
  { id: '3d-deco', nombre: 'Deco 3D: lámparas y floreros', precio: null, detalle: 'Según diseño', imagenes: [foto('3d-lamparas-floreros')], vertical: true, categoria: 'impresion-3d' },
  { id: '3d-organizadores', nombre: 'Deco 3D: organizadores y cajoncitos', precio: null, detalle: 'Según diseño', imagenes: [foto('3d-organizadores')], vertical: true, categoria: 'impresion-3d' },
  { id: '3d-ideas-utiles', nombre: 'Ideas útiles 3D', precio: null, detalle: 'Pequeñas soluciones para casa', imagenes: [foto('3d-ideas-utiles-casa')], vertical: true, categoria: 'impresion-3d' },
  { id: '3d-kit-sensorial', nombre: 'Kit sensorial 3D', precio: null, detalle: 'Texturas, formas y exploración', imagenes: [foto('3d-kit-sensorial')], vertical: true, categoria: 'impresion-3d' },
  { id: '3d-merchandising', nombre: 'Merchandising 3D', precio: null, detalle: 'Llaveros y detalles para tu marca', imagenes: [foto('3d-merchandising-llaveros')], vertical: true, categoria: 'impresion-3d' },
];
