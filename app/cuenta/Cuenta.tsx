'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Package } from 'lucide-react';

interface DatosCliente {
  email: string;
  nombre: string;
  telefono: string;
  direccion: string;
}

interface PedidoCliente {
  id: number;
  creadoEn: string;
  estado: keyof typeof ESTADOS;
  entrega: keyof typeof ENTREGAS;
  metodoPago: keyof typeof PAGOS;
  items: { id: string; nombre: string; cantidad: number; precio: number }[];
  envio: number;
  total: number;
}

const ESTADOS = {
  pendiente: { nombre: 'Pendiente de pago', color: 'bg-amber-100 text-amber-800' },
  pagado: { nombre: 'Pagado', color: 'bg-blue-100 text-blue-800' },
  aceptado: { nombre: 'En preparación', color: 'bg-purple-100 text-purple-800' },
  rechazado: { nombre: 'Cancelado', color: 'bg-red-100 text-red-800' },
  entregado: { nombre: 'Entregado', color: 'bg-green-100 text-green-800' },
  devuelto: { nombre: 'Devuelto', color: 'bg-gray-200 text-gray-700' },
};
const ENTREGAS = { montevideo: 'Cadetería en Montevideo', interior: 'Envío al interior', retiro: 'Retiro en Vivo Vinilo' };
const PAGOS = { mercadopago: 'Mercado Pago', transferencia: 'Transferencia bancaria', redes: 'Abitab / Redpagos' };

const CAMPO = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca';

type Estado =
  | { vista: 'cargando' }
  | { vista: 'login' }
  | { vista: 'error'; mensaje: string }
  | { vista: 'cuenta'; cliente: DatosCliente; pedidos: PedidoCliente[] };

export default function Cuenta() {
  const [estado, setEstado] = useState<Estado>({ vista: 'cargando' });
  const [email, setEmail] = useState('');
  const [clave, setClave] = useState('');
  const [entrando, setEntrando] = useState(false);
  const [errorLogin, setErrorLogin] = useState('');

  const cargar = useCallback(async () => {
    try {
      const respuesta = await fetch('/api/cuenta', { cache: 'no-store' });
      if (respuesta.status === 401) return setEstado({ vista: 'login' });
      const datos = await respuesta.json();
      if (!respuesta.ok) return setEstado({ vista: 'error', mensaje: datos.error ?? 'No pudimos cargar tu cuenta.' });
      setEstado({ vista: 'cuenta', cliente: datos.cliente, pedidos: datos.pedidos });
    } catch {
      setEstado({ vista: 'error', mensaje: 'No pudimos conectar con el servidor. Revisá tu conexión.' });
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde el servidor
    cargar();
  }, [cargar]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setEntrando(true);
    setErrorLogin('');
    try {
      const respuesta = await fetch('/api/cuenta/sesion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, clave }),
      });
      if (respuesta.ok) {
        setClave('');
        await cargar();
      } else {
        const datos = await respuesta.json().catch(() => ({}));
        setErrorLogin(datos.error ?? 'No pudimos iniciar sesión.');
      }
    } catch {
      setErrorLogin('No pudimos conectar con el servidor. Revisá tu conexión.');
    }
    setEntrando(false);
  };

  const salir = async () => {
    await fetch('/api/cuenta/sesion', { method: 'DELETE' }).catch(() => {});
    setEstado({ vista: 'login' });
  };

  if (estado.vista === 'cargando') {
    return <p className="text-center text-gray-500 py-16">Cargando...</p>;
  }

  if (estado.vista === 'error') {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <p role="alert" className="text-gray-700 mb-6">{estado.mensaje}</p>
        <button onClick={cargar} className="bg-oscuro hover:bg-black text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors cursor-pointer">
          Reintentar
        </button>
      </div>
    );
  }

  if (estado.vista === 'login') {
    return (
      <section className="max-w-md mx-auto px-4 py-12">
        <form onSubmit={entrar} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-xl font-bold text-texto">Iniciar sesión</h2>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-texto mb-1">Mail</label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={CAMPO}
            />
          </div>
          <div>
            <label htmlFor="login-clave" className="block text-sm font-medium text-texto mb-1">Contraseña</label>
            <input
              id="login-clave"
              type="password"
              required
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className={CAMPO}
            />
          </div>
          {errorLogin && (
            <p role="alert" className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{errorLogin}</p>
          )}
          <button
            type="submit"
            disabled={entrando}
            className="w-full bg-marca hover:bg-marca-hover text-white py-3 rounded-full font-semibold transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
          >
            {entrando ? 'Entrando...' : 'Entrar'}
          </button>
          <p className="text-xs text-gray-500 text-center">
            ¿Todavía no tenés cuenta? Se crea sola con tu primera compra: elegís tu contraseña al confirmar el pedido.{' '}
            <Link href="/lab" className="text-marca hover:underline">Ver productos</Link>
          </p>
          <p className="text-xs text-gray-500 text-center">
            ¿Olvidaste tu contraseña? <Link href="/contacto" className="text-marca hover:underline">Escribinos</Link> y te ayudamos.
          </p>
        </form>
      </section>
    );
  }

  const { cliente, pedidos } = estado;
  return (
    <section className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-8">
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col sm:flex-row sm:items-start justify-between gap-6">
        <dl className="space-y-1 text-sm">
          <div><dt className="inline text-gray-500">Nombre: </dt><dd className="inline font-semibold text-texto">{cliente.nombre}</dd></div>
          <div><dt className="inline text-gray-500">Mail: </dt><dd className="inline text-texto">{cliente.email}</dd></div>
          <div><dt className="inline text-gray-500">Celular: </dt><dd className="inline text-texto">{cliente.telefono}</dd></div>
          {cliente.direccion && <div><dt className="inline text-gray-500">Dirección: </dt><dd className="inline text-texto">{cliente.direccion}</dd></div>}
        </dl>
        <button
          onClick={salir}
          className="inline-flex items-center gap-2 border border-gray-300 hover:border-oscuro text-texto px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer self-start"
        >
          <LogOut className="w-4 h-4" /> Cerrar sesión
        </button>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-texto mb-4">Mis pedidos</h2>
        {pedidos.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
            <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-6">Todavía no tenés pedidos.</p>
            <Link href="/lab" className="inline-flex bg-marca hover:bg-marca-hover text-white px-6 py-2.5 rounded-full text-sm font-medium transition-colors">
              Ver productos
            </Link>
          </div>
        ) : (
          <ul className="space-y-4">
            {pedidos.map((p) => (
              <li key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <h3 className="text-lg font-bold text-texto">
                    Pedido #{p.id}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      {new Date(p.creadoEn).toLocaleDateString('es-UY', { dateStyle: 'medium' })}
                    </span>
                  </h3>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADOS[p.estado]?.color ?? 'bg-gray-100 text-gray-700'}`}>
                    {ESTADOS[p.estado]?.nombre ?? p.estado}
                  </span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1 mb-4">
                  {p.items.map((i) => (
                    <li key={i.id} className="flex justify-between gap-4">
                      <span>{i.cantidad} x {i.nombre}</span>
                      <span>${i.precio * i.cantidad}</span>
                    </li>
                  ))}
                  <li className="flex justify-between gap-4 text-gray-500">
                    <span>Envío</span>
                    <span>{p.envio === 0 ? 'Gratis' : `$${p.envio}`}</span>
                  </li>
                </ul>
                <div className="flex flex-wrap items-end justify-between gap-3 border-t border-gray-100 pt-3 text-sm">
                  <p className="text-gray-500">
                    {ENTREGAS[p.entrega] ?? p.entrega} · {PAGOS[p.metodoPago] ?? p.metodoPago}
                  </p>
                  <p className="text-lg font-bold text-texto">${p.total} UYU</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
