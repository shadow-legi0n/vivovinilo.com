'use client';

import React, { createContext, useContext, useSyncExternalStore } from 'react';

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen?: string;
  detalle?: string;
}

interface CartContextType {
  items: CartItem[];
  agregarAlCarrito: (item: CartItem) => void;
  eliminarDelCarrito: (id: string) => void;
  actualizarCantidad: (id: string, cantidad: number) => void;
  vaciarCarrito: () => void;
  subtotal: number;
  totalItems: number;
}

// El carrito vive en localStorage y React se suscribe con useSyncExternalStore.
// Antes se cargaba con un useEffect y otro useEffect lo guardaba: el de guardar
// corría primero con el carrito vacío y pisaba lo que había guardado.
const CLAVE = 'carrito_vivovinilo';
const VACIO: CartItem[] = [];

let cache: { raw: string | null; items: CartItem[] } = { raw: null, items: VACIO };
const suscriptores = new Set<() => void>();

function leer(): CartItem[] {
  let raw: string | null;
  try {
    raw = localStorage.getItem(CLAVE);
  } catch {
    return cache.items; // localStorage bloqueado: queda solo en memoria
  }
  if (raw !== cache.raw) {
    let items = VACIO;
    try {
      const datos = raw ? JSON.parse(raw) : VACIO;
      if (Array.isArray(datos)) items = datos;
    } catch {
      // JSON roto: se arranca con el carrito vacío
    }
    cache = { raw, items };
  }
  return cache.items;
}

function escribir(items: CartItem[]) {
  const raw = JSON.stringify(items);
  cache = { raw, items };
  try {
    localStorage.setItem(CLAVE, raw);
  } catch {
    // sin localStorage el carrito igual funciona hasta recargar
  }
  suscriptores.forEach((avisar) => avisar());
}

function suscribir(avisar: () => void) {
  suscriptores.add(avisar);
  window.addEventListener('storage', avisar); // cambios hechos en otra pestaña
  return () => {
    suscriptores.delete(avisar);
    window.removeEventListener('storage', avisar);
  };
}

const agregarAlCarrito = (nuevo: CartItem) => {
  const actual = leer();
  const existe = actual.some((i) => i.id === nuevo.id);
  escribir(
    existe
      ? actual.map((i) => (i.id === nuevo.id ? { ...i, cantidad: i.cantidad + nuevo.cantidad } : i))
      : [...actual, nuevo]
  );
};

const eliminarDelCarrito = (id: string) => escribir(leer().filter((i) => i.id !== id));

const actualizarCantidad = (id: string, cantidad: number) => {
  if (cantidad <= 0) {
    eliminarDelCarrito(id);
    return;
  }
  escribir(leer().map((i) => (i.id === id ? { ...i, cantidad } : i)));
};

const vaciarCarrito = () => escribir(VACIO);

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  // En el servidor el carrito siempre es vacío; al hidratar React pasa solo al real.
  const items = useSyncExternalStore(suscribir, leer, () => VACIO);

  const subtotal = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        agregarAlCarrito,
        eliminarDelCarrito,
        actualizarCantidad,
        vaciarCarrito,
        subtotal,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe usarse dentro de un CartProvider');
  }
  return context;
}
