// Datos generales del sitio en un solo lugar: Navbar, Footer y Contacto leen de acá.

export const sitio = {
  nombre: 'Vivo Vinilo',
  eslogan: 'Donde las ideas cobran vida',
  // WhatsApp en formato internacional sin "+" ni espacios; el otro es para mostrar.
  whatsapp: '59892557767',
  telefono: '+598 92 557 767',
  email: 'vivovinilouruguay@gmail.com',
  // Link de pago de Mercado Pago. Es de monto abierto: quien paga escribe el importe.
  mercadoPago: 'https://link.mercadopago.com.uy/vivovinilo',
  instagram: 'https://www.instagram.com/vivovinilouy',
  facebook: 'https://www.facebook.com/people/Vivo-Vinilo/61596046565795/',
};

// Dónde guarda el navegador el número del último pedido (para el mensaje de WhatsApp).
export const CLAVE_ULTIMO_PEDIDO = 'ultimo_pedido_vivovinilo';

export const navegacion = [
  { nombre: 'Inicio', href: '/' },
  { nombre: 'LAB', href: '/lab' },
  { nombre: 'ESTUDIO', href: '/estudio' },
  { nombre: 'Empresas y eventos', href: '/empresas' },
  { nombre: 'Regalos con experiencias', href: '/experiencias' },
  { nombre: 'Contacto y presupuestos', href: '/contacto' },
];

export function linkWhatsApp(mensaje = '') {
  const texto = mensaje ? `?text=${encodeURIComponent(mensaje)}` : '';
  return `https://wa.me/${sitio.whatsapp}${texto}`;
}
