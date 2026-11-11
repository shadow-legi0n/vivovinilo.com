'use client';

import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { IconoWhatsApp } from '../../components/Redes';
import { CLAVE_ULTIMO_PEDIDO, linkWhatsApp } from '../../lib/sitio';

// Se muestra cuando el cliente vuelve de Mercado Pago con el pago aprobado o pendiente.
export default function DespuesDelPago({ aprobado }: { aprobado: boolean }) {
  const { vaciarCarrito } = useCart();

  useEffect(() => {
    // Mercado Pago agrega el número de pago a la URL de vuelta. Se lo pasamos al
    // servidor, que confirma el estado con Mercado Pago y actualiza el pedido.
    const pago = new URLSearchParams(window.location.search).get('payment_id');
    if (pago) {
      fetch('/api/mp/verificar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pago }),
      }).catch(() => {});
    }
    if (aprobado) vaciarCarrito(); // el pedido ya está pago
  }, [aprobado, vaciarCarrito]);

  // El número de pedido se lee recién al hacer clic, así no hace falta estado.
  const abrirWhatsApp = () => {
    let numero: string | null = null;
    try {
      numero = localStorage.getItem(CLAVE_ULTIMO_PEDIDO);
    } catch {
      // sin localStorage el mensaje va sin número
    }
    const pedido = numero ? `mi pedido #${numero}` : 'mi pedido';
    const mensaje = aprobado
      ? `Hola, acabo de pagar ${pedido} en la web. Les paso el comprobante y coordinamos la entrega.`
      : `Hola, hice el pago de ${pedido} en la web y quedó pendiente. Quedo atento.`;
    window.open(linkWhatsApp(mensaje), '_blank', 'noopener');
  };

  return (
    <button
      onClick={abrirWhatsApp}
      className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb857] text-white px-6 py-3 rounded-full font-semibold transition-colors mb-6 cursor-pointer"
    >
      <IconoWhatsApp className="w-5 h-5" /> Coordinar entrega por WhatsApp
    </button>
  );
}
