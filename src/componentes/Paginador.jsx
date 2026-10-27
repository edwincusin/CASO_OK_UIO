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

  // Limitar los botones de páginas a mostrar si hay muchas páginas
  let paginasVisibles = [];
  if (totalPaginas <= 7) {
    paginasVisibles = Array.from({ length: totalPaginas }, (_, i) => i + 1);
  } else {
    if (paginaActual <= 4) {
      paginasVisibles = [1, 2, 3, 4, 5, '...', totalPaginas];
    } else if (paginaActual >= totalPaginas - 3) {
      paginasVisibles = [1, '...', totalPaginas - 4, totalPaginas - 3, totalPaginas - 2, totalPaginas - 1, totalPaginas];
    } else {
      paginasVisibles = [1, '...', paginaActual - 1, paginaActual, paginaActual + 1, '...', totalPaginas];
    }
  }

  return (
    <div className="paginador-contenedor">
      <span className="paginador-info">
        Mostrando <strong>{inicio}</strong> - <strong>{fin}</strong> de <strong>{totalRegistros}</strong> registros
      </span>
      <div className="paginador-botones">
        <button
          type="button"
          className="boton boton--contorno paginador-btn"
          disabled={paginaActual === 1}
          onClick={() => alCambiarPagina(paginaActual - 1)}
        >
          Anterior
        </button>

        {paginasVisibles.map((item, idx) =>
          item === '...' ? (
            <span key={`puntos-${idx}`} className="paginador-puntos">
              ...
            </span>
          ) : (
            <button
              type="button"
              key={`pag-${item}`}
              className={`boton-pagina ${item === paginaActual ? 'boton-pagina--activo' : ''}`}
              onClick={() => alCambiarPagina(Number(item))}
            >
              {item}
            </button>
          )
        )}

        <button
          type="button"
          className="boton boton--contorno paginador-btn"
          disabled={paginaActual === totalPaginas || totalPaginas === 0}
          onClick={() => alCambiarPagina(paginaActual + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
