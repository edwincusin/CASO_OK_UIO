import { useState, useMemo, useRef, useEffect } from 'react';

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

  // Filtrado eficiente en tiempo real sobre los 3000+ lotes
  const lotesFiltrados = useMemo(() => {
    if (!busqueda.trim()) return [];
    const termino = busqueda.toUpperCase().trim();
    return lotes
      .filter((l) => l.nombre.toUpperCase().includes(termino))
      .slice(0, 15); // Limitar a las primeras 15 coincidencias visuales para máximo rendimiento
  }, [busqueda, lotes]);

  function manejarSeleccion(lote) {
    const nombreMayus = lote.nombre.toUpperCase();
    setBusqueda(nombreMayus);
    alSeleccionar(nombreMayus, lote.etapa);
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
        placeholder="Escriba para buscar lote (ej. LOTE 508.6, LOTE 101)..."
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
              <strong>{lote.nombre}</strong> — <span className="texto-tenue">{lote.etapa || 'SIN ETAPA'}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
