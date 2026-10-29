import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Download, Filter, RefreshCw } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Insignia from '../componentes/Insignia';
import Paginador from '../componentes/Paginador';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { useToast } from '../contextos/ContextoToast';
import { exportarCasosAPDF } from '../utilidades/generadorPdf';
import { estados } from '../datos/datosDemo';
import { puedeVerReportes } from '../utilidades/permisos';
import { formatearFecha, formatearFechaHora, obtenerTiempoResolucion } from '../utilidades/fechas';

/**
 * Reportes
 * Módulo de auditoría general y exportación oficial de reportes en PDF con jsPDF y jspdf-autotable.
 * Filtros por creador, fechas, etapa, categoría y área, con vista previa y paginación a 20 registros.
 */
export default function Reportes() {
  const { usuario, usuarios } = useSesion();
  const { todosLosCasos } = useCasos();
  const { etapas, categorias, areas } = useCatalogos();
  const { nombreUrbanizacion } = useConfiguracion();
  const { mostrarToast } = useToast();

  if (!puedeVerReportes(usuario)) {
    return <Navigate to="/" replace />;
  }

  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: '',
    categoria: '',
    area: '',
    etapa: '',
    usuarioCreadorId: '',
  });

  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  const casosFiltrados = useMemo(() => {
    return (todosLosCasos || []).filter((c) => {
      if (filtros.fechaInicio && c.fechaRecepcion < filtros.fechaInicio) return false;
      if (filtros.fechaFin && c.fechaRecepcion > filtros.fechaFin) return false;
      if (filtros.categoria && c.categoria !== filtros.categoria) return false;
      if (filtros.area && c.area !== filtros.area) return false;
      if (filtros.etapa && c.etapa !== filtros.etapa) return false;
      if (filtros.usuarioCreadorId && c.registradoPor !== Number(filtros.usuarioCreadorId))
        return false;
      return true;
    });
  }, [todosLosCasos, filtros]);

  const totalRegistros = casosFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;
  const casosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return casosFiltrados.slice(inicio, inicio + porPagina);
  }, [casosFiltrados, paginaActual, porPagina]);

  function descargarPDF() {
    if (casosFiltrados.length === 0) {
      mostrarToast('No hay casos para exportar con los filtros actuales', 'alerta');
      return;
    }

    exportarCasosAPDF(casosFiltrados, filtros, usuarios, nombreUrbanizacion);
    mostrarToast('Reporte general PDF generado exitosamente', 'exito');
  }

  function limpiarFiltros() {
    setFiltros({
      fechaInicio: '',
      fechaFin: '',
      categoria: '',
      area: '',
      etapa: '',
      usuarioCreadorId: '',
    });
    setPaginaActual(1);
  }

  return (
    <div className="pagina-reportes">
      <EncabezadoPagina
        titulo="Reportes y Auditoría General"
        subtitulo="Filtros de fiscalización, tiempos de atención y exportación oficial en PDF"
      >
        <button type="button" className="boton boton--primario" onClick={descargarPDF}>
          <Download size={18} />
          <span>Exportar Reporte PDF</span>
        </button>
      </EncabezadoPagina>

      {/* PANEL DE FILTROS AVANZADOS */}
      <section className="formulario__seccion">
        <h2 className="formulario__seccion-titulo">
          <Filter size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
          <span>Filtros de Auditoría y Búsqueda</span>
        </h2>

        <div className="grid-formulario-3">
          <div className="campo-grupo">
            <label className="campo-label" htmlFor="fechaInicio">
              Fecha Desde
            </label>
            <input
              id="fechaInicio"
              type="date"
              className="campo-input"
              value={filtros.fechaInicio}
              onChange={(e) => {
                setFiltros({ ...filtros, fechaInicio: e.target.value });
                setPaginaActual(1);
              }}
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="fechaFin">
              Fecha Hasta
            </label>
            <input
              id="fechaFin"
              type="date"
              className="campo-input"
              value={filtros.fechaFin}
              onChange={(e) => {
                setFiltros({ ...filtros, fechaFin: e.target.value });
                setPaginaActual(1);
              }}
            />
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="usuarioCreadorId">
              Usuario que Registró el Caso
            </label>
            <select
              id="usuarioCreadorId"
              className="campo-select"
              value={filtros.usuarioCreadorId}
              onChange={(e) => {
                setFiltros({ ...filtros, usuarioCreadorId: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">Todos los usuarios</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} ({u.cedula})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-formulario-3">
          <div className="campo-grupo">
            <label className="campo-label" htmlFor="etapaFiltro">
              Etapa
            </label>
            <select
              id="etapaFiltro"
              className="campo-select"
              value={filtros.etapa}
              onChange={(e) => {
                setFiltros({ ...filtros, etapa: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">Todas las etapas</option>
              {etapas.map((et) => (
                <option key={et.id} value={et.nombre}>
                  {et.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="catFiltro">
              Categoría
            </label>
            <select
              id="catFiltro"
              className="campo-select"
              value={filtros.categoria}
              onChange={(e) => {
                setFiltros({ ...filtros, categoria: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="areaFiltro">
              Área Responsable
            </label>
            <select
              id="areaFiltro"
              className="campo-select"
              value={filtros.area}
              onChange={(e) => {
                setFiltros({ ...filtros, area: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">Todas las áreas</option>
              {areas.map((a) => (
                <option key={a.id} value={a.nombre}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '8px',
            borderTop: '1px solid var(--color-borde-suave)',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <span className="texto-tenue">
            Casos coincidentes:{' '}
            <strong className="texto-mono" style={{ color: 'var(--color-texto-principal)' }}>
              {casosFiltrados.length}
            </strong>{' '}
            de {todosLosCasos?.length || 0}
          </span>
          <button
            type="button"
            className="boton boton--sm boton--secundario"
            onClick={limpiarFiltros}
          >
            <RefreshCw size={14} />
            <span>Restablecer Filtros</span>
          </button>
        </div>
      </section>

      {/* PREVISUALIZACIÓN DE REGISTROS A EXPORTAR */}
      <section className="tarjeta">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '8px',
          }}
        >
          <h2 className="tarjeta__titulo">
            <FileText size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>Previsualización de Registros</span>
          </h2>
          <button
            type="button"
            className="boton boton--sm boton--secundario"
            onClick={descargarPDF}
          >
            <Download size={14} />
            <span>Descargar PDF ({casosFiltrados.length})</span>
          </button>
        </div>

        <div className="contenedor-tabla">
          <table className="tabla-datos tabla-responsiva-apilada">
            <thead>
              <tr>
                <th>Código</th>
                <th>Apertura</th>
                <th>Tiempo</th>
                <th>Reportante</th>
                <th>Lote</th>
                <th>Etapa</th>
                <th>Calle Ppal.</th>
                <th>Área</th>
                <th>Estado</th>
                <th>Registrado Por</th>
              </tr>
            </thead>
            <tbody>
              {casosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '2rem' }}>
                    No existen registros con el criterio de búsqueda seleccionado.
                  </td>
                </tr>
              ) : (
                casosPaginados.map((c) => {
                  const creador = usuarios.find((u) => u.id === c.registradoPor);
                  const fechaApertura = c.fechaHoraApertura
                    ? formatearFechaHora(c.fechaHoraApertura)
                    : formatearFecha(c.fechaRecepcion);
                  const duracion = obtenerTiempoResolucion(c);

                  return (
                    <tr key={c.id}>
                      <td data-label="Código" className="columna-codigo">
                        {c.codigo}
                      </td>
                      <td data-label="Apertura" className="texto-mono">
                        {fechaApertura}
                      </td>
                      <td data-label="Tiempo" className="texto-mono">
                        {duracion}
                      </td>
                      <td data-label="Reportante">{c.reportanteNombre}</td>
                      <td data-label="Lote" className="texto-mono">
                        {c.reportanteLote || c.lote || '—'}
                      </td>
                      <td data-label="Etapa">{c.etapa || '—'}</td>
                      <td data-label="Calle Ppal.">{c.callePrimaria || c.calle || '—'}</td>
                      <td data-label="Área">{c.area}</td>
                      <td data-label="Estado">
                        <Insignia
                          texto={estados[c.estado]?.nombre || c.estado}
                          variante={c.estado}
                          color={estados[c.estado]?.color}
                        />
                      </td>
                      <td data-label="Registrado Por">
                        <span className="texto-tenue">
                          {creador
                            ? `${creador.nombre} ${creador.apellido}`
                            : `ID ${c.registradoPor}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          alCambiarPagina={(pag) => setPaginaActual(pag)}
          totalRegistros={totalRegistros}
          porPagina={porPagina}
        />
      </section>
    </div>
  );
}
