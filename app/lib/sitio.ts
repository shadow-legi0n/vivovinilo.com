// Datos generales del sitio en un solo lugar: Navbar, Footer y Contacto leen de acá.

export const sitio = {
  nombre: 'Vivo Vinilo',
  eslogan: 'Donde las ideas cobran vida',
  // TODO: completar con los datos reales.
  // WhatsApp en formato internacional sin "+" ni espacios (ej: 59899123456).
  // Si queda vacío, el link abre WhatsApp y deja elegir el contacto.
  whatsapp: '',
  // Link de pago de Mercado Pago. Es de monto abierto: quien paga escribe el importe.
  mercadoPago: 'https://link.mercadopago.com.uy/vivovinilo',
  instagram: '',
  youtube: '',
};

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
