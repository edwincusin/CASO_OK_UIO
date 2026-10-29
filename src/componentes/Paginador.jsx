/**
 * Paginador
 * Controles de paginación limpios con botones redondeados,
 * estado activo resaltado e información textual del rango actual.
 */
export default function Paginador({
  paginaActual = 1,
  totalPaginas = 1,
  alCambiarPagina,
  totalRegistros = 0,
  porPagina = 20,
}) {
  if (totalPaginas <= 1 && totalRegistros <= porPagina) return null;

  const inicio = totalRegistros === 0 ? 0 : (paginaActual - 1) * porPagina + 1;
  const fin = Math.min(paginaActual * porPagina, totalRegistros);

  let paginasVisibles = [];
  if (totalPaginas <= 7) {
    paginasVisibles = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  } else {
    if (paginaActual <= 4) {
      paginasVisibles = [1, 2, 3, 4, 5, '...', totalPaginas];
    } else if (paginaActual >= totalPaginas - 3) {
      paginasVisibles = [
        1,
        '...',
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas,
      ];
    } else {
      paginasVisibles = [
        1,
        '...',
        paginaActual - 1,
        paginaActual,
        paginaActual + 1,
        '...',
        totalPaginas,
      ];
    }
  }

  return (
    <div className="paginador">
      <span className="paginador__info">
        Mostrando <strong className="texto-mono">{inicio}</strong> -{' '}
        <strong className="texto-mono">{fin}</strong> de{' '}
        <strong className="texto-mono">{totalRegistros}</strong> registros
      </span>

      <div className="paginador__controles">
        <button
          type="button"
          className="paginador__boton"
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(paginaActual - 1)}
          aria-label="Página anterior"
        >
          Anterior
        </button>

        {paginasVisibles.map((item, idx) =>
          item === '...' ? (
            <span
              key={`puntos-${idx}`}
              style={{ padding: '0 6px', color: 'var(--color-texto-tenue)' }}
            >
              ...
            </span>
          ) : (
            <button
              type="button"
              key={`pag-${item}`}
              className={`paginador__boton ${
                item === paginaActual ? 'paginador__boton--activo' : ''
              }`}
              onClick={() => alCambiarPagina(Number(item))}
              aria-label={`Ir a página ${item}`}
              aria-current={item === paginaActual ? 'page' : undefined}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="paginador__boton"
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => alCambiarPagina(paginaActual + 1)}
          aria-label="Página siguiente"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
