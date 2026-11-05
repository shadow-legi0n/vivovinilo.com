'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
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

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const guardado = localStorage.getItem('carrito_vivovinilo');
    if (guardado) {
      try {
        setItems(JSON.parse(guardado));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('carrito_vivovinilo', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (nuevo: CartItem) => {
    setItems((prev) => {
      const existe = prev.find((i) => i.id === nuevo.id);
      if (existe) {
        return prev.map((i) =>
          i.id === nuevo.id ? { ...i, cantidad: i.cantidad + nuevo.cantidad } : i
        );
      }
      return [...prev, nuevo];
    });
  };

  const eliminarDelCarrito = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const actualizarCantidad = (id: string, cantidad: number) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(id);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, cantidad } : i))
    );
  };

  const vaciarCarrito = () => setItems([]);

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