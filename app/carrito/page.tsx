'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import Foto from '../components/Foto';
import { IconoWhatsApp } from '../components/Redes';
import { productos } from '../lib/catalogo';
import { sitio, linkWhatsApp, CLAVE_ULTIMO_PEDIDO } from '../lib/sitio';
import { calcularEnvio, MONTO_ENVIO_GRATIS, type ZonaEnvio } from '../lib/envio';
import { Trash2, Plus, Minus, ShieldCheck, Truck, CreditCard, ShoppingBag, CheckCircle, ExternalLink } from 'lucide-react';

export default function CarritoPage() {
  const { items, agregarAlCarrito, eliminarDelCarrito, actualizarCantidad, vaciarCarrito, subtotal } = useCart();
  const [zonaEnvio, setZonaEnvio] = useState<ZonaEnvio>('montevideo');
  const [metodoPago, setMetodoPago] = useState<'mercadopago' | 'transferencia' | 'redes'>('mercadopago');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const [pagando, setPagando] = useState(false);
  const [numeroPedido, setNumeroPedido] = useState<number | null>(null);
  const [errorPago, setErrorPago] = useState('');

  const nombresPago = {
    mercadopago: 'Mercado Pago',
    transferencia: 'transferencia bancaria',
    redes: 'Abitab / Redpagos',
  };

  const montoEnvioGratis = MONTO_ENVIO_GRATIS;
  const costoEnvio = calcularEnvio(zonaEnvio, subtotal);

  const totalFinal = subtotal + costoEnvio;
  const faltaParaEnvioGratis = Math.max(0, montoEnvioGratis - subtotal);

  const cargarProductosDemo = () => {
    productos
      .filter((p) => p.precio !== null)
      .slice(0, 3)
      .forEach((p) =>
        agregarAlCarrito({ id: p.id, nombre: p.nombre, precio: p.precio ?? 0, cantidad: 1, detalle: p.detalle, imagen: p.imagen })
      );
  };

  // Plan B, solo si el servidor todavía no tiene el token de Mercado Pago: el link de
  // pago no acepta el monto por la URL, así que se copia el total y el cliente lo pega.
  const irAMercadoPago = () => {
    navigator.clipboard?.writeText(String(totalFinal)).catch(() => {});
    window.open(sitio.mercadoPago, '_blank', 'noopener');
  };

  // Al confirmar, el servidor guarda el pedido y calcula el total (del navegador solo
  // salen ids y cantidades). Si se paga con Mercado Pago devuelve a dónde ir a pagar.
  const finalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    setPagando(true);
    setErrorPago('');
    try {
      const respuesta = await fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(({ id, cantidad }) => ({ id, cantidad })),
          zonaEnvio,
          metodoPago,
          nombre,
          telefono,
          direccion,
        }),
      });
      const datos = await respuesta.json();
      if (datos.pedido) {
        setNumeroPedido(datos.pedido);
        try {
          localStorage.setItem(CLAVE_ULTIMO_PEDIDO, String(datos.pedido)); // lo usa la página de pago aprobado
        } catch {
          // sin localStorage solo se pierde el número en el mensaje de WhatsApp
        }
      }
      if (respuesta.ok && datos.url) {
        window.location.assign(datos.url);
        return; // se queda en "Procesando..." mientras carga Mercado Pago
      }
      if (respuesta.ok) {
        setPedidoConfirmado(true);
      } else {
        setErrorPago(datos.error ?? 'No pudimos registrar el pedido. Probá de nuevo.');
      }
    } catch {
      setErrorPago('No pudimos conectar con el servidor. Revisá tu conexión y probá de nuevo.');
    }
    setPagando(false);
  };

  // Resumen del pedido para mandar por WhatsApp. Es también la red de seguridad:
  // si la base de datos no respondió, el pedido igual llega por este mensaje.
  const mensajePedido = [
    `Hola, soy ${nombre}. Hice ${numeroPedido ? `el pedido #${numeroPedido}` : 'un pedido'} en la web:`,
    ...items.map((i) => `- ${i.cantidad} x ${i.nombre} ($${i.precio * i.cantidad})`),
    `Envío: ${costoEnvio === 0 ? 'gratis' : `$${costoEnvio}`}`,
    `Total: $${totalFinal}`,
    zonaEnvio === 'retiro' ? 'Entrega: retiro en Vivo Vinilo' : `Entrega: ${direccion} (${zonaEnvio === 'montevideo' ? 'Montevideo' : 'interior'})`,
    `Pago: ${nombresPago[metodoPago]}`,
  ].join('\n');

  return (
    <main className="min-h-screen bg-fondo py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-texto mb-8">Tu Carrito y Pago</h1>

        {pedidoConfirmado ? (
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mb-16">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-texto mb-2">
              {numeroPedido ? `¡Pedido #${numeroPedido} registrado!` : '¡Ya casi! Envianos tu pedido'}
            </h2>
            <p className="text-gray-600 mb-6">
              Gracias <strong>{nombre || 'por tu compra'}</strong>. Elegiste abonar mediante{' '}
              <strong>{nombresPago[metodoPago]}</strong> por un total de <strong>${totalFinal} UYU</strong>.
            </p>
            {metodoPago === 'mercadopago' && (
              <div className="bg-fondo border border-gray-100 rounded-2xl p-6 mb-6">
                <p className="text-sm text-gray-600 mb-1">Monto a ingresar en Mercado Pago</p>
                <p className="text-4xl font-bold text-texto mb-4">${totalFinal}</p>
                <button
                  onClick={irAMercadoPago}
                  className="inline-flex items-center gap-2 bg-[#009EE3] hover:bg-[#0087c2] text-white px-6 py-3 rounded-full font-semibold transition-colors cursor-pointer"
                >
                  Pagar con Mercado Pago <ExternalLink className="w-4 h-4" />
                </button>
                <p className="text-xs text-gray-500 mt-3">
                  Se abre el link de pago de Vivo Vinilo y el monto queda copiado: pegalo o escribilo donde dice
                  &quot;Ingresá el monto a pagar&quot;.
                </p>
              </div>
            )}
            <a
              href={linkWhatsApp(mensajePedido)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fb857] text-white px-6 py-3 rounded-full font-semibold transition-colors mb-2"
            >
              <IconoWhatsApp className="w-5 h-5" /> Enviar pedido por WhatsApp
            </a>
            <p className="text-xs text-gray-500 mb-6">
              {numeroPedido
                ? 'Mandanos el pedido por WhatsApp para coordinar la entrega y enviar el comprobante.'
                : 'Mandanos el pedido por WhatsApp para que lo recibamos y coordinemos la entrega.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => {
                  vaciarCarrito();
                  setNumeroPedido(null);
                  setPedidoConfirmado(false);
                }}
                className="bg-marca hover:bg-marca-hover text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Volver a empezar
              </button>
              <Link
                href="/"
                className="bg-oscuro hover:bg-black text-white px-6 py-3 rounded-full font-medium transition-colors"
              >
                Ir al inicio
              </Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100 mb-16">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-texto mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-500 mb-6">Agrega productos personalizados del LAB o carga artículos de prueba para ver cómo funciona el pago.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={cargarProductosDemo}
                className="bg-marca hover:bg-marca-hover text-white px-6 py-3 rounded-full font-medium transition-colors shadow-md"
              >
                Cargar productos de prueba
              </button>
              <Link
                href="/lab"
                className="border border-gray-300 hover:border-oscuro text-texto px-6 py-3 rounded-full font-medium transition-colors"
              >
                Explorar catálogo
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* COLUMNA IZQUIERDA: LISTA DE PRODUCTOS */}
            <div className="lg:col-span-2 space-y-6">
              {/* Barra de progreso de Envío Gratis en Montevideo */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                {subtotal >= montoEnvioGratis ? (
                  <p className="text-green-600 font-medium flex items-center gap-2 text-sm">
                    <Truck className="w-5 h-5" /> ¡Felicitaciones! Tenés <strong>Envío Gratis en Montevideo</strong> (superaste los $3500).
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-gray-700 mb-2">
                      Te faltan <strong>${faltaParaEnvioGratis}</strong> para obtener <strong>Envío Gratis en Montevideo</strong> (a partir de $3500).
                    </p>
                    <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-marca h-full transition-all duration-300"
                        style={{ width: `${Math.min(100, (subtotal / montoEnvioGratis) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Productos */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-center gap-4">
                    <Foto src={item.imagen} alt={item.nombre} className="w-20 h-20 rounded-xl border border-gray-100" />
                    <div className="flex-1 text-center sm:text-left">
                      <h3 className="font-semibold text-texto">{item.nombre}</h3>
                      {item.detalle && <p className="text-xs text-gray-500">{item.detalle}</p>}
                      <p className="text-marca font-bold mt-1">${item.precio}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-6 text-center font-medium">{item.cantidad}</span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <p className="font-bold text-texto">${item.precio * item.cantidad}</p>
                    </div>

                    <button
                      onClick={() => eliminarDelCarrito(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-2"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* COLUMNA DERECHA: RESUMEN Y PAGO */}
            <form onSubmit={finalizarCompra} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 h-fit space-y-6">
              <h2 className="text-xl font-bold text-texto border-b border-gray-100 pb-4">Datos de envío y pago</h2>

              {/* Datos del cliente */}
              <div className="space-y-3">
                <input
                  type="text"
                  required
                  placeholder="Nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca"
                />
                <input
                  type="tel"
                  required
                  placeholder="Celular / WhatsApp (ej: 099 123 456)"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca"
                />
                <input
                  type="text"
                  required={zonaEnvio !== 'retiro'}
                  placeholder="Dirección de entrega"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca"
                />
              </div>

              {/* Selección de Envío */}
              <div>
                <label className="block text-sm font-semibold text-texto mb-2">Modalidad de entrega</label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="envio"
                        checked={zonaEnvio === 'montevideo'}
                        onChange={() => setZonaEnvio('montevideo')}
                      />
                      Cadetería en Montevideo
                    </span>
                    <span className="font-semibold text-texto">
                      {subtotal >= montoEnvioGratis ? <span className="text-green-600">GRATIS</span> : '$220'}
                    </span>
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="envio"
                        checked={zonaEnvio === 'interior'}
                        onChange={() => setZonaEnvio('interior')}
                      />
                      Envío al Interior (DAC / UES)
                    </span>
                    <span className="font-semibold text-texto">$290</span>
                  </label>

                  <label className="flex items-center justify-between p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="envio"
                        checked={zonaEnvio === 'retiro'}
                        onChange={() => setZonaEnvio('retiro')}
                      />
                      Retiro en Vivo Vinilo
                    </span>
                    <span className="font-semibold text-green-600">GRATIS</span>
                  </label>
                </div>
              </div>

              {/* Selección de Método de Pago */}
              <div>
                <label className="block text-sm font-semibold text-texto mb-2">Método de pago</label>
                <div className="space-y-2 text-sm">
                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <input
                      type="radio"
                      name="pago"
                      checked={metodoPago === 'mercadopago'}
                      onChange={() => setMetodoPago('mercadopago')}
                    />
                    <span>Mercado Pago (Tarjetas débito / crédito hasta 12 cuotas)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <input
                      type="radio"
                      name="pago"
                      checked={metodoPago === 'transferencia'}
                      onChange={() => setMetodoPago('transferencia')}
                    />
                    <span>Transferencia Bancaria (BROU / Itaú / Santander / Prex)</span>
                  </label>
                  <label className="flex items-center gap-2 p-3 border border-gray-200 rounded-xl cursor-pointer hover:border-marca">
                    <input
                      type="radio"
                      name="pago"
                      checked={metodoPago === 'redes'}
                      onChange={() => setMetodoPago('redes')}
                    />
                    <span>Efectivo en Abitab / Redpagos</span>
                  </label>
                </div>
              </div>

              {/* Totales */}
              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Costo de envío</span>
                  <span>{costoEnvio === 0 ? 'GRATIS' : `$${costoEnvio}`}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-texto pt-2 border-t border-gray-100">
                  <span>Total a pagar</span>
                  <span>${totalFinal} UYU</span>
                </div>
              </div>

              {errorPago && (
                <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  {errorPago}
                </p>
              )}

              <button
                type="submit"
                disabled={pagando}
                className="w-full bg-marca hover:bg-marca-hover text-white py-3.5 rounded-full font-semibold transition-colors shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {pagando ? 'Procesando...' : 'Confirmar y Pagar'}
              </button>
            </form>
          </div>
        )}

        {/* SECCIÓN DE SELLOS DE CONFIANZA (Los 3 bloques de tu referencia) */}
        <section className="bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
              <ShieldCheck className="w-9 h-9 text-blue-500" />
            </div>
            <h3 className="text-xl font-bold text-[#0A194E] mb-2">Compras Seguras</h3>
            <p className="text-gray-500 text-sm max-w-xs">Esta web está protegida</p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
              <Truck className="w-9 h-9 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#0A194E] mb-2">Envíos Gratis</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Todos los envíos son gratuitos a partir de los $3500 - En Montevideo
            </p>
          </div>

          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mb-4">
              <CreditCard className="w-9 h-9 text-amber-500" />
            </div>
            <h3 className="text-xl font-bold text-[#0A194E] mb-2">Métodos de pago</h3>
            <p className="text-gray-500 text-sm max-w-xs">
              Contamos con todos los métodos de pago usados en el mercado
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}