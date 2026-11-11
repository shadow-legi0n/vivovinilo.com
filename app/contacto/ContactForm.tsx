'use client';

import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { linkWhatsApp } from '../lib/sitio';

const areas = ['LAB (productos personalizados)', 'ESTUDIO', 'Empresas y eventos', 'Regalos con experiencias', 'Otra consulta'];

const campo = 'w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-marca';

// No hay backend todavía: el formulario arma el mensaje y lo abre en WhatsApp.
export default function ContactForm() {
  const [nombre, setNombre] = useState('');
  const [area, setArea] = useState(areas[0]);
  const [mensaje, setMensaje] = useState('');

  const enviar = (e: React.FormEvent) => {
    e.preventDefault();
    const texto = `Hola, soy ${nombre}.\nConsulta: ${area}\n\n${mensaje}`;
    window.open(linkWhatsApp(texto), '_blank', 'noopener');
  };

  return (
    <form onSubmit={enviar} className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 space-y-4">
      <div>
        <label htmlFor="nombre" className="block text-sm font-semibold text-texto mb-1">Nombre</label>
        <input id="nombre" type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} className={campo} />
      </div>
      <div>
        <label htmlFor="area" className="block text-sm font-semibold text-texto mb-1">¿Sobre qué es la consulta?</label>
        <select id="area" value={area} onChange={(e) => setArea(e.target.value)} className={`${campo} bg-white`}>
          {areas.map((a) => (
            <option key={a}>{a}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="mensaje" className="block text-sm font-semibold text-texto mb-1">Contanos tu idea</label>
        <textarea id="mensaje" required rows={5} value={mensaje} onChange={(e) => setMensaje(e.target.value)} placeholder="Qué necesitás, cantidad, fecha..." className={campo} />
      </div>
      <button type="submit" className="w-full inline-flex items-center justify-center gap-2 bg-marca hover:bg-marca-hover text-white py-3 rounded-full font-semibold transition-colors cursor-pointer">
        <MessageCircle className="w-5 h-5" /> Enviar por WhatsApp
      </button>
    </form>
  );
}
