'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Eye, EyeOff, ImagePlus, Pencil, Plus, Trash2, X } from 'lucide-react';
import Foto from '../components/Foto';
import type { Catalogo as DatosCatalogo, Categoria, Producto } from '../lib/catalogo';
import {
  borrarCategoria,
  borrarProducto,
  cargarCatalogo,
  guardarCategoria,
  guardarProducto,
  moverCategoria,
  moverProducto,
  type DatosProducto,
} from './acciones';

const boton = 'px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-wait';
const campo = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca bg-white';
const etiqueta = 'block text-sm font-semibold text-texto mb-1';
const iconoBoton = 'p-2 rounded-full border border-gray-200 hover:border-oscuro text-texto transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-default';

const MAXIMO_FOTOS = 12;
const LADO_MAXIMO = 1600; // px: suficiente para verse bien en pantalla grande y pesar poco

// Achica la foto en el navegador antes de subirla: las del celular pesan 3-8 MB y
// así quedan en 200-500 KB, la web carga rápido y no se pasa el límite de subida.
async function achicar(archivo: File): Promise<Blob> {
  let imagen: ImageBitmap;
  try {
    imagen = await createImageBitmap(archivo, { imageOrientation: 'from-image' });
  } catch {
    throw new Error(`No pudimos abrir "${archivo.name}". Si es una foto de iPhone (HEIC), guardala como JPG y probá de nuevo.`);
  }
  const escala = Math.min(1, LADO_MAXIMO / Math.max(imagen.width, imagen.height));
  const lienzo = document.createElement('canvas');
  lienzo.width = Math.round(imagen.width * escala);
  lienzo.height = Math.round(imagen.height * escala);
  const ctx = lienzo.getContext('2d');
  if (!ctx) throw new Error('Tu navegador no pudo procesar la foto.');
  ctx.fillStyle = '#ffffff'; // las PNG con fondo transparente quedan sobre blanco, no sobre negro
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.drawImage(imagen, 0, 0, lienzo.width, lienzo.height);
  imagen.close();
  const blob = await new Promise<Blob | null>((resolver) => lienzo.toBlob(resolver, 'image/jpeg', 0.85));
  if (!blob) throw new Error('Tu navegador no pudo procesar la foto.');
  return blob;
}

// Sube una foto y devuelve su dirección. Si la sesión venció lo avisa con "sesion".
async function subirFoto(archivo: File): Promise<string> {
  const datos = new FormData();
  datos.append('foto', await achicar(archivo), 'foto.jpg');
  const respuesta = await fetch('/api/admin/fotos', { method: 'POST', body: datos });
  const cuerpo = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(cuerpo.error ?? 'No se pudo subir la foto.');
  return cuerpo.url;
}

// --- Selector de fotos (lo usan productos y categorías) ---

function Fotos({
  imagenes,
  maximo,
  habilitado,
  onCambio,
  onError,
}: {
  imagenes: string[];
  maximo: number;
  habilitado: boolean;
  onCambio: (imagenes: string[]) => void;
  onError: (mensaje: string) => void;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [subiendo, setSubiendo] = useState(0);
  // Se guarda la lista más reciente: si se suben varias fotos a la vez, cada una se
  // agrega a lo que ya hay y no se pisan entre sí.
  const actuales = useRef(imagenes);
  useEffect(() => {
    actuales.current = imagenes;
  }, [imagenes]);

  const unica = maximo === 1; // categorías: una sola foto, que se reemplaza al subir otra

  const agregar = async (archivos: FileList | null) => {
    if (!archivos || archivos.length === 0) return;
    if (unica) actuales.current = []; // "Cambiar foto": la nueva reemplaza a la anterior
    const lugar = maximo - actuales.current.length;
    const elegidos = Array.from(archivos).slice(0, Math.max(0, lugar));
    if (elegidos.length < archivos.length) onError(`Se pueden cargar hasta ${maximo} foto(s); el resto no se subió.`);
    setSubiendo((n) => n + elegidos.length);
    for (const archivo of elegidos) {
      try {
        const url = await subirFoto(archivo);
        actuales.current = [...actuales.current, url];
        onCambio(actuales.current);
      } catch (e) {
        onError(e instanceof Error ? e.message : 'No se pudo subir la foto.');
      }
      setSubiendo((n) => n - 1);
    }
    if (entrada.current) entrada.current.value = '';
  };

  const mover = (i: number, j: number) => {
    const lista = [...imagenes];
    [lista[i], lista[j]] = [lista[j], lista[i]];
    onCambio(lista);
  };

  const selector = (
    <input
      ref={entrada}
      type="file"
      accept="image/jpeg,image/png,image/webp"
      multiple={!unica}
      className="hidden"
      onChange={(e) => agregar(e.target.files)}
    />
  );

  if (unica) {
    const actual = imagenes[0];
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full max-w-xs aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shrink-0">
          {subiendo > 0 ? (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 animate-pulse">Subiendo...</div>
          ) : actual ? (
            <Foto src={actual} alt="Foto de la categoría" className="w-full h-full" />
          ) : (
            <button
              type="button"
              disabled={!habilitado}
              onClick={() => entrada.current?.click()}
              className="w-full h-full flex flex-col items-center justify-center gap-2 text-sm text-gray-500 hover:text-marca transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ImagePlus className="w-8 h-8" />
              Sin foto: tocá para elegir una
            </button>
          )}
        </div>
        <div className="flex flex-wrap sm:flex-col gap-2">
          <button
            type="button"
            disabled={!habilitado || subiendo > 0}
            onClick={() => entrada.current?.click()}
            className={`${boton} bg-oscuro hover:bg-black text-white inline-flex items-center gap-2`}
          >
            <ImagePlus className="w-4 h-4" /> {actual ? 'Cambiar foto' : 'Elegir foto'}
          </button>
          {actual && (
            <button
              type="button"
              disabled={subiendo > 0}
              onClick={() => onCambio([])}
              className={`${boton} border border-gray-300 hover:border-red-400 hover:text-red-600 text-texto inline-flex items-center gap-2`}
            >
              <X className="w-4 h-4" /> Quitar foto
            </button>
          )}
          <p className="text-xs text-gray-500 max-w-[220px]">Es la foto de la tarjeta de la categoría. El cambio se ve en la web al tocar &quot;Guardar&quot;.</p>
        </div>
        {selector}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
        {imagenes.map((src, i) => (
          <div key={src} className="relative group rounded-xl overflow-hidden border border-gray-200 bg-white">
            <Foto src={src} alt={`Foto ${i + 1}`} className="w-full aspect-square" />
            {i === 0 && maximo > 1 && (
              <span className="absolute top-1.5 left-1.5 bg-marca text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PRINCIPAL</span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/55 p-1">
              <button type="button" aria-label="Mover a la izquierda" disabled={i === 0} onClick={() => mover(i, i - 1)} className="p-1 text-white disabled:opacity-30 cursor-pointer">
                <ArrowLeft className="w-4 h-4" />
              </button>
              <button type="button" aria-label="Quitar foto" onClick={() => onCambio(imagenes.filter((u) => u !== src))} className="p-1 text-white hover:text-red-300 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
              <button type="button" aria-label="Mover a la derecha" disabled={i === imagenes.length - 1} onClick={() => mover(i, i + 1)} className="p-1 text-white disabled:opacity-30 cursor-pointer">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {Array.from({ length: subiendo }, (_, i) => (
          <div key={`subiendo-${i}`} className="rounded-xl border border-dashed border-gray-300 aspect-square flex items-center justify-center text-xs text-gray-500 animate-pulse">
            Subiendo...
          </div>
        ))}
        {imagenes.length + subiendo < maximo && (
          <button
            type="button"
            disabled={!habilitado}
            onClick={() => entrada.current?.click()}
            className="rounded-xl border-2 border-dashed border-gray-300 hover:border-marca aspect-square flex flex-col items-center justify-center gap-1 text-xs text-gray-500 hover:text-marca transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ImagePlus className="w-6 h-6" />
            Agregar foto
          </button>
        )}
      </div>
      {selector}
      <p className="text-xs text-gray-500 mt-2">La primera foto es la que se ve en la tarjeta. Usá las flechas para cambiar el orden y la X para quitar una. Los cambios se ven en la web al tocar &quot;Guardar&quot;.</p>
    </div>
  );
}

// --- Formulario de producto ---

const productoVacio = (categoria: string): DatosProducto => ({
  nombre: '',
  categoria,
  precio: null,
  desde: false,
  detalle: '',
  descripcion: '',
  imagenes: [],
  vertical: false,
  visible: true,
});

function EditorProducto({
  inicial,
  categorias,
  fotos,
  onGuardado,
  onCancelar,
  onSesion,
}: {
  inicial: DatosProducto;
  categorias: Categoria[];
  fotos: boolean;
  onGuardado: (aviso: string) => void;
  onCancelar: () => void;
  onSesion: () => void;
}) {
  const [datos, setDatos] = useState(inicial);
  const [precioTexto, setPrecioTexto] = useState(inicial.precio === null ? '' : String(inicial.precio));
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const cambiar = <K extends keyof DatosProducto>(clave: K, valor: DatosProducto[K]) => setDatos((d) => ({ ...d, [clave]: valor }));

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    const limpio = precioTexto.replace(/[$.\s]/g, '');
    if (limpio !== '' && !/^\d+$/.test(limpio)) return setError('El precio va solo con números, sin centavos (ej: 450).');
    setGuardando(true);
    setError('');
    const r = await guardarProducto({ ...datos, precio: limpio === '' ? null : Number(limpio) });
    setGuardando(false);
    if (r.ok) onGuardado(`"${r.producto.nombre}" guardado. Ya se ve en la web.`);
    else if ('sesion' in r) onSesion();
    else setError(r.error);
  };

  const eliminar = async () => {
    if (!inicial.id || !window.confirm(`¿Borrar "${inicial.nombre}"? No se puede deshacer. Si solo querés sacarlo un tiempo, usá "Oculto".`)) return;
    setGuardando(true);
    const r = await borrarProducto(inicial.id);
    setGuardando(false);
    if (r.ok) onGuardado(`"${inicial.nombre}" borrado.`);
    else if ('sesion' in r) onSesion();
    else setError(r.error);
  };

  return (
    <form onSubmit={guardar} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-texto">{inicial.id ? 'Editar producto' : 'Nuevo producto'}</h2>
        <button type="button" onClick={onCancelar} className={`${boton} border border-gray-300 hover:border-oscuro text-texto`}>Volver</button>
      </div>

      <div>
        <label className={etiqueta}>Fotos</label>
        {!fotos && <p className="text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-2 mb-2">Falta conectar el almacenamiento de fotos: por ahora no se pueden subir.</p>}
        <Fotos imagenes={datos.imagenes} maximo={MAXIMO_FOTOS} habilitado={fotos} onCambio={(l) => cambiar('imagenes', l)} onError={setError} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="p-nombre" className={etiqueta}>Nombre *</label>
          <input id="p-nombre" required maxLength={120} value={datos.nombre} onChange={(e) => cambiar('nombre', e.target.value)} className={campo} placeholder="Ej: Taza mágica" />
        </div>
        <div>
          <label htmlFor="p-categoria" className={etiqueta}>Categoría *</label>
          <select id="p-categoria" required value={datos.categoria} onChange={(e) => cambiar('categoria', e.target.value)} className={campo}>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="p-precio" className={etiqueta}>Precio en pesos</label>
          <input id="p-precio" inputMode="numeric" value={precioTexto} onChange={(e) => setPrecioTexto(e.target.value)} className={campo} placeholder="Vacío = precio a cotizar" />
          <label className="flex items-center gap-2 text-sm text-gray-700 mt-2">
            <input type="checkbox" checked={datos.desde} disabled={precioTexto.trim() === ''} onChange={(e) => cambiar('desde', e.target.checked)} />
            Mostrar como &quot;Desde $...&quot;
          </label>
        </div>
        <div>
          <label htmlFor="p-detalle" className={etiqueta}>Detalle corto</label>
          <input id="p-detalle" maxLength={200} value={datos.detalle} onChange={(e) => cambiar('detalle', e.target.value)} className={campo} placeholder="Ej: Blanca, 11 oz, con tu diseño" />
          <p className="text-xs text-gray-500 mt-1">Se ve debajo del nombre en la tarjeta.</p>
        </div>
      </div>

      <div>
        <label htmlFor="p-descripcion" className={etiqueta}>Descripción</label>
        <textarea id="p-descripcion" rows={6} maxLength={4000} value={datos.descripcion} onChange={(e) => cambiar('descripcion', e.target.value)} className={campo} placeholder="Medidas, materiales, cómo se personaliza, tiempos de entrega..." />
        <p className="text-xs text-gray-500 mt-1">Se ve en la página del producto. Los renglones se respetan.</p>
      </div>

      <div className="flex flex-wrap gap-6 text-sm text-gray-700">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={datos.visible} onChange={(e) => cambiar('visible', e.target.checked)} />
          Visible en la web
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={datos.vertical} onChange={(e) => cambiar('vertical', e.target.checked)} />
          La foto principal es vertical (afiche)
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}

      <div className="flex flex-wrap justify-between gap-3 pt-2 border-t border-gray-100">
        {inicial.id ? (
          <button type="button" onClick={eliminar} disabled={guardando} className={`${boton} text-red-600 hover:bg-red-50 inline-flex items-center gap-2`}>
            <Trash2 className="w-4 h-4" /> Borrar producto
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={guardando} className={`${boton} bg-marca hover:bg-marca-hover text-white px-8`}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

// --- Formulario de categoría ---

function EditorCategoria({
  inicial,
  fotos,
  onGuardado,
  onCancelar,
  onSesion,
}: {
  inicial: Categoria | null;
  fotos: boolean;
  onGuardado: (aviso: string) => void;
  onCancelar: () => void;
  onSesion: () => void;
}) {
  const [nombre, setNombre] = useState(inicial?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(inicial?.descripcion ?? '');
  const [img, setImg] = useState<string[]>(inicial?.img ? [inicial.img] : []);
  const [error, setError] = useState('');
  const [guardando, setGuardando] = useState(false);

  const guardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setError('');
    const r = await guardarCategoria({ slug: inicial?.slug, nombre, descripcion, img: img[0] ?? null });
    setGuardando(false);
    if (r.ok) onGuardado(`Categoría "${r.categoria.nombre}" guardada.`);
    else if ('sesion' in r) onSesion();
    else setError(r.error);
  };

  const eliminar = async () => {
    if (!inicial || !window.confirm(`¿Borrar la categoría "${inicial.nombre}"?`)) return;
    setGuardando(true);
    const r = await borrarCategoria(inicial.slug);
    setGuardando(false);
    if (r.ok) onGuardado(`Categoría "${inicial.nombre}" borrada.`);
    else if ('sesion' in r) onSesion();
    else setError(r.error);
  };

  return (
    <form onSubmit={guardar} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-texto">{inicial ? 'Editar categoría' : 'Nueva categoría'}</h2>
        <button type="button" onClick={onCancelar} className={`${boton} border border-gray-300 hover:border-oscuro text-texto`}>Volver</button>
      </div>
      <div>
        <label className={etiqueta}>Foto</label>
        <Fotos imagenes={img} maximo={1} habilitado={fotos} onCambio={setImg} onError={setError} />
      </div>
      <div>
        <label htmlFor="c-nombre" className={etiqueta}>Nombre *</label>
        <input id="c-nombre" required maxLength={80} value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
      </div>
      <div>
        <label htmlFor="c-descripcion" className={etiqueta}>Descripción</label>
        <input id="c-descripcion" maxLength={300} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} className={campo} />
      </div>
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
      <div className="flex flex-wrap justify-between gap-3 pt-2 border-t border-gray-100">
        {inicial ? (
          <button type="button" onClick={eliminar} disabled={guardando} className={`${boton} text-red-600 hover:bg-red-50 inline-flex items-center gap-2`}>
            <Trash2 className="w-4 h-4" /> Borrar categoría
          </button>
        ) : (
          <span />
        )}
        <button type="submit" disabled={guardando} className={`${boton} bg-marca hover:bg-marca-hover text-white px-8`}>
          {guardando ? 'Guardando...' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

// --- Pantalla principal de la pestaña ---

type Edicion =
  | { tipo: 'producto'; datos: DatosProducto }
  | { tipo: 'categoria'; categoria: Categoria | null }
  | null;

const aDatos = (p: Producto): DatosProducto => ({
  id: p.id,
  nombre: p.nombre,
  categoria: p.categoria,
  precio: p.precio,
  desde: Boolean(p.desde),
  detalle: p.detalle,
  descripcion: p.descripcion,
  imagenes: p.imagenes,
  vertical: Boolean(p.vertical),
  visible: p.visible,
});

export default function Catalogo({ onSesionVencida }: { onSesionVencida: () => void }) {
  const [catalogo, setCatalogo] = useState<DatosCatalogo | null>(null);
  const [fotos, setFotos] = useState(false);
  const [edicion, setEdicion] = useState<Edicion>(null);
  const [aviso, setAviso] = useState('');
  const [error, setError] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    const r = await cargarCatalogo();
    if (r.ok) {
      setCatalogo(r.catalogo);
      setFotos(r.fotos);
    } else if ('sesion' in r) onSesionVencida();
    else setError(r.error);
  }, [onSesionVencida]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial desde el servidor
    cargar();
  }, [cargar]);

  const alGuardar = (mensaje: string) => {
    setEdicion(null);
    setAviso(mensaje);
    setError('');
    window.scrollTo({ top: 0 });
    cargar();
  };

  const accion = async (hacer: () => Promise<{ ok: boolean; error?: string; sesion?: false }>) => {
    setOcupado(true);
    setAviso('');
    const r = await hacer();
    setOcupado(false);
    if (r.ok) cargar();
    else if ('sesion' in r) onSesionVencida();
    else setError(r.error ?? 'No se pudo hacer el cambio.');
  };

  if (!catalogo) {
    return error ? (
      <p role="alert" className="bg-white rounded-3xl p-10 text-center text-red-700 border border-gray-100">{error}</p>
    ) : (
      <p className="text-center text-gray-500 py-16">Cargando productos...</p>
    );
  }

  if (edicion?.tipo === 'producto') {
    return (
      <EditorProducto
        inicial={edicion.datos}
        categorias={catalogo.categorias}
        fotos={fotos}
        onGuardado={alGuardar}
        onCancelar={() => setEdicion(null)}
        onSesion={onSesionVencida}
      />
    );
  }
  if (edicion?.tipo === 'categoria') {
    return (
      <EditorCategoria inicial={edicion.categoria} fotos={fotos} onGuardado={alGuardar} onCancelar={() => setEdicion(null)} onSesion={onSesionVencida} />
    );
  }

  const filtro = busqueda.trim().toLowerCase();
  const coincide = (p: Producto) => !filtro || `${p.nombre} ${p.detalle}`.toLowerCase().includes(filtro);
  const primera = catalogo.categorias[0]?.slug ?? '';

  return (
    <div className="space-y-8">
      {aviso && <p role="status" className="text-sm text-green-800 bg-green-50 border border-green-100 rounded-xl px-4 py-3">{aviso}</p>}
      {error && <p role="alert" className="text-sm text-red-700 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>}
      {!fotos && (
        <p className="text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
          Falta conectar el almacenamiento de fotos (Vercel Blob). Se pueden editar textos y precios, pero no subir fotos.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setEdicion({ tipo: 'producto', datos: productoVacio(primera) })}
          disabled={!primera}
          className={`${boton} bg-marca hover:bg-marca-hover text-white inline-flex items-center gap-2`}
        >
          <Plus className="w-4 h-4" /> Nuevo producto
        </button>
        <input type="search" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar producto..." className={`${campo} max-w-xs`} />
      </div>

      {catalogo.categorias.map((cat, ci) => {
        const lista = catalogo.productos.filter((p) => p.categoria === cat.slug);
        const visibles = lista.filter(coincide);
        if (filtro && visibles.length === 0) return null;
        return (
          <section key={cat.slug} className="bg-white rounded-3xl p-5 md:p-6 shadow-sm border border-gray-100">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <Foto src={cat.img} alt={cat.nombre} className="w-12 h-12 rounded-xl" />
                <div>
                  <h2 className="text-lg font-bold text-texto">{cat.nombre}</h2>
                  <p className="text-xs text-gray-500">{lista.length} producto(s)</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button aria-label="Subir categoría" disabled={ocupado || ci === 0} onClick={() => accion(() => moverCategoria(cat.slug, 'arriba'))} className={iconoBoton}>
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button aria-label="Bajar categoría" disabled={ocupado || ci === catalogo.categorias.length - 1} onClick={() => accion(() => moverCategoria(cat.slug, 'abajo'))} className={iconoBoton}>
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => setEdicion({ tipo: 'categoria', categoria: cat })} className={`${boton} border border-gray-300 hover:border-oscuro text-texto inline-flex items-center gap-2`}>
                  <Pencil className="w-4 h-4" /> Categoría
                </button>
                <button onClick={() => setEdicion({ tipo: 'producto', datos: productoVacio(cat.slug) })} className={`${boton} border border-gray-300 hover:border-oscuro text-texto inline-flex items-center gap-2`}>
                  <Plus className="w-4 h-4" /> Producto
                </button>
              </div>
            </div>

            {visibles.length === 0 ? (
              <p className="text-sm text-gray-500">Todavía no hay productos en esta categoría.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {visibles.map((p) => {
                  const i = lista.indexOf(p);
                  return (
                    <li key={p.id} className="py-3 flex items-center gap-3">
                      <Foto src={p.imagenes[0]} alt={p.nombre} className="w-14 h-14 rounded-xl shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`font-semibold truncate ${p.visible ? 'text-texto' : 'text-gray-400 line-through'}`}>{p.nombre}</p>
                        <p className="text-xs text-gray-500 truncate">
                          {p.precio === null ? 'A cotizar' : `${p.desde ? 'Desde ' : ''}$${p.precio}`} · {p.imagenes.length} foto(s)
                          {!p.visible && ' · Oculto'}
                        </p>
                      </div>
                      <button
                        aria-label={p.visible ? 'Ocultar de la web' : 'Mostrar en la web'}
                        title={p.visible ? 'Ocultar de la web' : 'Mostrar en la web'}
                        disabled={ocupado}
                        onClick={() => accion(() => guardarProducto({ ...aDatos(p), visible: !p.visible }))}
                        className={iconoBoton}
                      >
                        {p.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                      {!filtro && (
                        <>
                          <button aria-label="Subir" disabled={ocupado || i === 0} onClick={() => accion(() => moverProducto(p.id, 'arriba'))} className={`${iconoBoton} hidden sm:block`}>
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button aria-label="Bajar" disabled={ocupado || i === lista.length - 1} onClick={() => accion(() => moverProducto(p.id, 'abajo'))} className={`${iconoBoton} hidden sm:block`}>
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button onClick={() => setEdicion({ tipo: 'producto', datos: aDatos(p) })} className={`${boton} bg-oscuro hover:bg-black text-white inline-flex items-center gap-2`}>
                        <Pencil className="w-4 h-4" /> Editar
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        );
      })}

      {!filtro && (
        <button onClick={() => setEdicion({ tipo: 'categoria', categoria: null })} className={`${boton} border border-dashed border-gray-400 hover:border-marca hover:text-marca text-texto inline-flex items-center gap-2`}>
          <Plus className="w-4 h-4" /> Nueva categoría
        </button>
      )}
    </div>
  );
}
