// Encabezado oscuro que comparten todas las páginas internas.
export default function PageHeader({
  titulo,
  subtitulo,
  children,
}: {
  titulo: string;
  subtitulo?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="bg-oscuro text-white w-full">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-14 md:py-20">
        <h1 className="text-4xl md:text-5xl font-bold mb-3">{titulo}</h1>
        {subtitulo && <p className="text-lg text-gray-300 max-w-2xl">{subtitulo}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
