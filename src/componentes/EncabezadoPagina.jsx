/**
 * EncabezadoPagina
 * Título principal y subtítulo contextual de cada pantalla con espacio para acciones a la derecha.
 */
export default function EncabezadoPagina({ titulo, subtitulo, children }) {
  return (
    <div className="encabezado-pagina">
      <div>
        <h1>{titulo}</h1>
        {subtitulo && <p className="texto-tenue" style={{ marginTop: '0.15rem' }}>{subtitulo}</p>}
      </div>
      {children && <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>{children}</div>}
    </div>
  );
}
