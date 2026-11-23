'use client';

import { useCallback, useEffect, useState } from 'react';
import { LogOut, RefreshCw } from 'lucide-react';
import { IconoWhatsApp } from '../components/Redes';
import type { EstadoPedido, Pedido } from '../lib/pedidos';
import Catalogo from './Catalogo';

const ESTADOS: Record<EstadoPedido, { nombre: string; color: string }> = {
  pendiente: { nombre: 'Pendiente de pago', color: 'bg-amber-100 text-amber-800' },
  pagado: { nombre: 'Pagado', color: 'bg-green-100 text-green-800' },
  aceptado: { nombre: 'Aceptado', color: 'bg-blue-100 text-blue-800' },
  entregado: { nombre: 'Entregado', color: 'bg-gray-200 text-gray-700' },
  rechazado: { nombre: 'Rechazado', color: 'bg-red-100 text-red-800' },
  devuelto: { nombre: 'Pago devuelto', color: 'bg-purple-100 text-purple-800' },
};

const PAGOS = { mercadopago: 'Mercado Pago', transferencia: 'Transferencia bancaria', redes: 'Abitab / Redpagos' };
const ENTREGAS = { montevideo: 'Cadetería en Montevideo', interior: 'Envío al interior', retiro: 'Retiro en Vivo Vinilo' };
const MP_ESTADOS: Record<string, string> = {
  approved: 'aprobado',
  pending: 'pendiente',
  in_process: 'en proceso',
  rejected: 'rechazado',
  refunded: 'devuelto',
  cancelled: 'cancelado',
};

// Arma el link al chat del cliente. Los celulares uruguayos se escriben 09x: se pasa a 5989x.
function chatCliente(p: Pedido) {
  let numero = p.telefono.replace(/\D/g, '');
  if (numero.startsWith('0')) numero = `598${numero.slice(1)}`;
  else if (!numero.startsWith('598')) numero = `598${numero}`;
  const pregunta =
    p.entrega === 'retiro'
      ? '¿Cuándo te queda bien pasar a retirarlo?'
      : '¿Nos pasás la ubicación para coordinar el envío?';
  const mensaje = `Hola ${p.nombre}, te escribimos de Vivo Vinilo por tu pedido #${p.id}. ${pregunta}`;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

type Respuesta =
  | { vista: 'login' }
  | { vista: 'error'; aviso: string }
  | { vista: 'listo'; pedidos: Pedido[]; mercadoPago: boolean };

// Pide los pedidos al servidor. Sin sesión responde 401 y el panel muestra el login.
async function pedirPedidos(): Promise<Respuesta> {
  try {
    const respuesta = await fetch('/api/admin/pedidos', { cache: 'no-store' });
    const datos = await respuesta.json();
    if (respuesta.status === 401) return { vista: 'login' };
    if (!respuesta.ok) return { vista: 'error', aviso: datos.error ?? 'No se pudieron cargar los pedidos.' };
    return { vista: 'listo', pedidos: datos.pedidos, mercadoPago: datos.mercadoPago };
  } catch {
    return { vista: 'error', aviso: 'No pudimos conectar con el servidor.' };
  }
}

const boton = 'px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait';

export default function Panel() {
  const [vista, setVista] = useState<'cargando' | 'login' | 'listo' | 'error'>('cargando');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [hayMP, setHayMP] = useState(false);
  const [aviso, setAviso] = useState('');
  const [filtro, setFiltro] = useState<EstadoPedido | 'todos'>('todos');
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [clave, setClave] = useState('');
  const [seccion, setSeccion] = useState<'pedidos' | 'productos'>('pedidos');
  const sesionVencida = useCallback(() => setVista('login'), []);

  // Aplica al estado lo que respondió el servidor.
  const aplicar = useCallback((r: Respuesta) => {
    if (r.vista === 'listo') {
      setPedidos(r.pedidos);
      setHayMP(r.mercadoPago);
    }
    setAviso(r.vista === 'error' ? r.aviso : '');
    setVista(r.vista);
  }, []);

  const cargar = () => pedirPedidos().then(aplicar);

  // Al abrir el panel se piden los pedidos; el estado se actualiza cuando llega la respuesta.
  useEffect(() => {
    pedirPedidos().then(aplicar);
  }, [aplicar]);

  const entrar = async (e: React.FormEvent) => {
    e.preventDefault();
    setAviso('');
    const respuesta = await fetch('/api/admin/sesion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave }),
    });
    if (respuesta.ok) {
      setClave('');
      setVista('cargando');
      cargar();
    } else {
      setAviso((await respuesta.json()).error ?? 'No se pudo entrar.');
    }
  };

  const salir = async () => {
    await fetch('/api/admin/sesion', { method: 'DELETE' });
    setPedidos([]);
    setVista('login');
  };

  const accion = async (pedido: Pedido, nombre: string, confirmar?: string) => {
    if (confirmar && !window.confirm(confirmar)) return;
    setOcupado(pedido.id);
    setAviso('');
    try {
      const respuesta = await fetch(`/api/admin/pedidos/${pedido.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: nombre }),
      });
      const datos = await respuesta.json();
      if (respuesta.status === 401) setVista('login');
      else if (!respuesta.ok) setAviso(`Pedido #${pedido.id}: ${datos.error}`);
      else setPedidos((lista) => lista.map((p) => (p.id === pedido.id ? datos.pedido : p)));
    } catch {
      setAviso('No pudimos conectar con el servidor.');
    }
    setOcupado(null);
  };

  if (vista === 'cargando') {
    return <p className="text-center text-gray-500 py-24">Cargando...</p>;
  }

  if (vista === 'login') {
    return (
      <section className="max-w-sm mx-auto px-4 py-24">
        <form onSubmit={entrar} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
          <h1 className="text-xl font-bold text-texto">Panel de Vivo Vinilo</h1>
          <div>
            <label htmlFor="clave" className="block text-sm font-semibold text-texto mb-1">Contraseña</label>
            <input
              id="clave"
              type="password"
              required
              autoComplete="current-password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca"
            />
          </div>
          {aviso && <p role="alert" className="text-sm text-red-600">{aviso}</p>}
          <button type="submit" className={`${boton} w-full bg-marca hover:bg-marca-hover text-white py-3`}>Entrar</button>
        </form>
      </section>
    );
  }

  if (vista === 'error') {
    return (
      <section className="max-w-md mx-auto px-4 py-24 text-center">
        <p role="alert" className="text-gray-700 mb-6">{aviso}</p>
        <button onClick={cargar} className={`${boton} bg-oscuro hover:bg-black text-white`}>Reintentar</button>
      </section>
    );
  }

  const cantidad = (estado: EstadoPedido) => pedidos.filter((p) => p.estado === estado).length;
  const visibles = filtro === 'todos' ? pedidos : pedidos.filter((p) => p.estado === filtro);

  return (
    <section className="max-w-5xl mx-auto px-4 md:px-8 py-10">
      <nav aria-label="Secciones del panel" className="flex gap-2 mb-8 border-b border-gray-200">
        {(['pedidos', 'productos'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeccion(s)}
            aria-current={seccion === s}
            className={`px-5 py-3 -mb-px border-b-2 text-sm font-semibold transition-colors cursor-pointer ${
              seccion === s ? 'border-marca text-marca' : 'border-transparent text-gray-500 hover:text-texto'
            }`}
          >
            {s === 'pedidos' ? 'Pedidos' : 'Productos y fotos'}
          </button>
        ))}
      </nav>

      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-bold text-texto">{seccion === 'pedidos' ? 'Pedidos' : 'Productos'}</h1>
        <div className="flex gap-2">
          {seccion === 'pedidos' && <button onClick={cargar} className={`${boton} border border-gray-300 hover:border-oscuro text-texto inline-flex items-center gap-2`}>
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>}
          <button onClick={salir} className={`${boton} border border-gray-300 hover:border-oscuro text-texto inline-flex items-center gap-2`}>
            <LogOut className="w-4 h-4" /> Salir
          </button>
        </div>
      </div>

      {seccion === 'productos' ? (
        <Catalogo onSesionVencida={sesionVencida} />
      ) : (
      <>
      <div className="flex flex-wrap gap-2 mb-6">
        <button onClick={() => setFiltro('todos')} className={`${boton} ${filtro === 'todos' ? 'bg-oscuro text-white' : 'bg-white border border-gray-200 text-texto'}`}>
          Todos ({pedidos.length})
        </button>
        {(Object.keys(ESTADOS) as EstadoPedido[]).map((estado) => (
          <button
            key={estado}
            onClick={() => setFiltro(estado)}
            className={`${boton} ${filtro === estado ? 'bg-oscuro text-white' : 'bg-white border border-gray-200 text-texto'}`}
          >
            {ESTADOS[estado].nombre} ({cantidad(estado)})
          </button>
        ))}
      </div>

      {aviso && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">{aviso}</p>
      )}

      {visibles.length === 0 ? (
        <p className="bg-white rounded-3xl p-10 text-center text-gray-500 border border-gray-100">
          {pedidos.length === 0 ? 'Todavía no hay pedidos.' : 'No hay pedidos en este estado.'}
        </p>
      ) : (
        <div className="space-y-4">
          {visibles.map((p) => {
            const abierto = p.estado === 'pendiente' || p.estado === 'pagado';
            const trabajando = ocupado === p.id;
            return (
              <article key={p.id} className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                  <h2 className="text-lg font-bold text-texto">
                    Pedido #{p.id}{' '}
                    <span className="text-sm font-normal text-gray-500">
                      {new Date(p.creadoEn).toLocaleString('es-UY', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                  </h2>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${ESTADOS[p.estado].color}`}>{ESTADOS[p.estado].nombre}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <dl className="space-y-1">
                    <div><dt className="inline text-gray-500">Cliente: </dt><dd className="inline font-semibold text-texto">{p.nombre}</dd></div>
                    <div><dt className="inline text-gray-500">Celular: </dt><dd className="inline text-texto">{p.telefono}</dd></div>
                    {p.email && <div><dt className="inline text-gray-500">Mail: </dt><dd className="inline text-texto">{p.email}</dd></div>}
                    <div><dt className="inline text-gray-500">Entrega: </dt><dd className="inline text-texto">{ENTREGAS[p.entrega]}</dd></div>
                    {p.direccion && <div><dt className="inline text-gray-500">Dirección: </dt><dd className="inline text-texto">{p.direccion}</dd></div>}
                    <div><dt className="inline text-gray-500">Pago: </dt><dd className="inline text-texto">{PAGOS[p.metodoPago]}</dd></div>
                    {p.mpPagoId && (
                      <div>
                        <dt className="inline text-gray-500">Mercado Pago: </dt>
                        <dd className="inline text-texto">pago {p.mpPagoId} ({MP_ESTADOS[p.mpEstado ?? ''] ?? p.mpEstado})</dd>
                      </div>
                    )}
                  </dl>

                  <div>
                    <ul className="space-y-1 mb-2">
                      {p.items.map((i) => (
                        <li key={i.id} className="flex justify-between gap-4">
                          <span className="text-texto">{i.cantidad} × {i.nombre}</span>
                          <span className="text-gray-600">${i.precio * i.cantidad}</span>
                        </li>
                      ))}
                      <li className="flex justify-between gap-4 text-gray-600">
                        <span>Envío</span>
                        <span>{p.envio === 0 ? 'Gratis' : `$${p.envio}`}</span>
                      </li>
                    </ul>
                    <p className="flex justify-between font-bold text-texto border-t border-gray-100 pt-2">
                      <span>Total</span>
                      <span>${p.total} UYU</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-gray-100">
                  <a href={chatCliente(p)} target="_blank" rel="noopener noreferrer" className={`${boton} bg-[#25D366] hover:bg-[#1fb857] text-white inline-flex items-center gap-2`}>
                    <IconoWhatsApp className="w-4 h-4" /> Escribirle
                  </a>
                  {p.estado === 'pendiente' && p.metodoPago === 'mercadopago' && hayMP && (
                    <button disabled={trabajando} onClick={() => accion(p, 'verificar')} className={`${boton} border border-gray-300 hover:border-oscuro text-texto`}>
                      Consultar pago
                    </button>
                  )}
                  {p.estado === 'pendiente' && p.metodoPago !== 'mercadopago' && (
                    <button disabled={trabajando} onClick={() => accion(p, 'pagado')} className={`${boton} border border-gray-300 hover:border-oscuro text-texto`}>
                      Marcar como pagado
                    </button>
                  )}
                  {abierto && (
                    <>
                      <button disabled={trabajando} onClick={() => accion(p, 'aceptar')} className={`${boton} bg-oscuro hover:bg-black text-white`}>
                        Aceptar
                      </button>
                      <button
                        disabled={trabajando}
                        onClick={() => accion(p, 'rechazar', `¿Rechazar el pedido #${p.id}? Esto no devuelve el pago.`)}
                        className={`${boton} border border-red-200 text-red-700 hover:bg-red-50`}
                      >
                        Rechazar
                      </button>
                    </>
                  )}
                  {p.estado === 'aceptado' && (
                    <button disabled={trabajando} onClick={() => accion(p, 'entregar')} className={`${boton} bg-oscuro hover:bg-black text-white`}>
                      Marcar como entregado
                    </button>
                  )}
                  {p.mpEstado === 'approved' && p.estado !== 'devuelto' && hayMP && (
                    <button
                      disabled={trabajando}
                      onClick={() => accion(p, 'devolver', `¿Devolver $${p.total} al cliente del pedido #${p.id}? Mercado Pago le reintegra el pago completo y no se puede deshacer.`)}
                      className={`${boton} border border-red-200 text-red-700 hover:bg-red-50`}
                    >
                      Devolver pago
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
      </>
      )}
    </section>
  );
}
