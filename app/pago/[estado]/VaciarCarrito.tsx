'use client';

import { useEffect } from 'react';
import { useCart } from '../../context/CartContext';

// Se monta solo cuando el pago quedó aprobado: el pedido ya está pago, el carrito se limpia.
export default function VaciarCarrito() {
  const { vaciarCarrito } = useCart();
  useEffect(() => {
    vaciarCarrito();
  }, [vaciarCarrito]);
  return null;
}
