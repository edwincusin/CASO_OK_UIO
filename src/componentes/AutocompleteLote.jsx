import { useState, useMemo, useRef, useEffect } from 'react';

/**
 * AutocompleteLote
 * Autocompletado optimizado para el catálogo de lotes (NUMERO.SUBLOTE).
 * Muestra únicamente el código del lote, sin asociar etapas.
 */
export default function AutocompleteLote({ lotes = [], valorSeleccionado = '', alSeleccionar, error }) {
  const [busqueda, setBusqueda] = useState(valorSeleccionado || '');
  const [mostrarOpciones, setMostrarOpciones] = useState(false);
  const wrapperRef = useRef(null);

  // Sincronizar si cambia el valor seleccionado externamente
  useEffect(() => {
    setBusqueda(valorSeleccionado || '');
  }, [valorSeleccionado]);

  // Cerrar opciones al hacer clic afuera
  useEffect(() => {
    function handleClickAfuera(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setMostrarOpciones(false);
      }
    }
    document.addEventListener('mousedown', handleClickAfuera);
    return () => document.removeEventListener('mousedown', handleClickAfuera);
  }, []);

  // Filtrado en tiempo real con límite de 15 coincidencias
  const lotesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const termino = busqueda.toUpperCase().trim();
    return lotes
      .filter((l) => (l.nombre || '').toUpperCase().includes(termino))
      .slice(0, 15);
  }, [busqueda, lotes]);

  function manejarSeleccion(lote) {
    const nombreMayus = lote.nombre.toUpperCase();
    setBusqueda(nombreMayus);
    alSeleccionar(nombreMayus);
    setMostrarOpciones(false);
  }

  return (
    <div className="autocomplete-contenedor campo-grupo" ref={wrapperRef}>
      <label className="campo-label">
        LOTE DEL RESIDENTE <span className="campo-requerido">*</span>
      </label>
      <input
        type="text"
        value={busqueda}
        onChange={(e) => {
          const val = e.target.value.toUpperCase();
          setBusqueda(val);
          alSeleccionar(val);
          setMostrarOpciones(true);
        }}
        onFocus={() => {
          if (busqueda.trim().length > 0) setMostrarOpciones(true);
        }}
        placeholder="Ej: 189.CASA1, 12.3, 520.0"
        className={`campo-input ${error ? 'campo-input--error' : ''}`}
      />
      {error && <span className="campo-mensaje-error">{error}</span>}

      {mostrarOpciones && lotesFiltrados.length > 0 && (
        <ul className="autocomplete-lista">
          {lotesFiltrados.map((lote) => (
            <li
              key={lote.id}
              className="autocomplete-item"
              onClick={() => manejarSeleccion(lote)}
            >
              <strong>{lote.nombre}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
