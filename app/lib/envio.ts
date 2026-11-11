// Reglas de envío en un solo lugar: las usa el carrito (para mostrar) y el
// servidor (para cobrar), así nunca pueden dar números distintos.

export const ZONAS = ['montevideo', 'interior', 'retiro'] as const;
export type ZonaEnvio = (typeof ZONAS)[number];

export const MONTO_ENVIO_GRATIS = 3500;
const COSTO_MONTEVIDEO = 220;
const COSTO_INTERIOR = 290;

export function calcularEnvio(zona: ZonaEnvio, subtotal: number) {
  if (zona === 'retiro') return 0;
  if (zona === 'interior') return COSTO_INTERIOR;
  return subtotal >= MONTO_ENVIO_GRATIS ? 0 : COSTO_MONTEVIDEO;
}
