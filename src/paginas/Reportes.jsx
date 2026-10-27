import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Download, Filter, RefreshCw } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Insignia from '../componentes/Insignia';
import Paginador from '../componentes/Paginador';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { exportarCasosAPDF } from '../utilidades/generadorPdf';
import { estados } from '../datos/datosDemo';
import { puedeVerReportes } from '../utilidades/permisos';
import { formatearFecha } from '../utilidades/fechas';

export default function Reportes() {
  const { usuario, usuarios } = useSesion();
  const { todosLosCasos } = useCasos();
  const { etapas, categorias, areas } = useCatalogos();
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
      if (filtros.usuarioCreadorId && c.registradoPor !== Number(filtros.usuarioCreadorId)) return false;
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
      mostrarToast('NO HAY CASOS PARA EXPORTAR CON LOS FILTROS ACTUALES', 'alerta');
      return;
    }

    exportarCasosAPDF(casosFiltrados, filtros, usuarios);
    mostrarToast('REPORTE PDF GENERADO EXITOSAMENTE', 'exito');
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
    <>
      <EncabezadoPagina
        titulo="REPORTES Y AUDITORÍA GENERAL"
        subtitulo="Quinde Control · Filtros por creador, fechas y exportación oficial en PDF"
      >
        <button className="boton boton--primario" onClick={descargarPDF}>
          <Download size={18} /> EXPORTAR PDF
        </button>
      </EncabezadoPagina>

      {/* PANEL DE FILTROS AVANZADOS */}
      <section className="tarjeta formulario">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Filter size={18} style={{ color: 'var(--color-primario)' }} />
          <h2>FILTROS DE AUDITORÍA Y BÚSQUEDA</h2>
        </div>

        <div className="grid-3">
          <div className="campo-grupo">
            <label className="campo-label">FECHA DESDE</label>
            <input
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
            <label className="campo-label">FECHA HASTA</label>
            <input
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
            <label className="campo-label">USUARIO QUE REGISTRÓ EL CASO</label>
            <select
              className="campo-input"
              value={filtros.usuarioCreadorId}
              onChange={(e) => {
                setFiltros({ ...filtros, usuarioCreadorId: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">TODOS LOS USUARIOS</option>
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nombre} {u.apellido} ({u.cedula})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="campo-grupo">
            <label className="campo-label">ETAPA</label>
            <select
              className="campo-input"
              value={filtros.etapa}
              onChange={(e) => {
                setFiltros({ ...filtros, etapa: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">TODAS LAS ETAPAS</option>
              {etapas.map((et) => (
                <option key={et.id} value={et.nombre}>
                  {et.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">CATEGORÍA</label>
            <select
              className="campo-input"
              value={filtros.categoria}
              onChange={(e) => {
                setFiltros({ ...filtros, categoria: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">TODAS LAS CATEGORÍAS</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.nombre}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="campo-grupo">
            <label className="campo-label">ÁREA RESPONSABLE</label>
            <select
              className="campo-input"
              value={filtros.area}
              onChange={(e) => {
                setFiltros({ ...filtros, area: e.target.value });
                setPaginaActual(1);
              }}
            >
              <option value="">TODAS LAS ÁREAS</option>
              {areas.map((a) => (
                <option key={a.id} value={a.nombre}>
                  {a.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="acciones" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="texto-tenue">
            CASOS COINCIDENTES: <strong>{casosFiltrados.length}</strong> DE {todosLosCasos?.length || 0}
          </span>
          <button type="button" className="boton boton--contorno" onClick={limpiarFiltros}>
            <RefreshCw size={14} /> RESTABLECER FILTROS
          </button>
        </div>
      </section>

      {/* PREVISUALIZACIÓN DE TABLA CON PAGINACIÓN A 20 */}
      <section className="tarjeta">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h2>PREVISUALIZACIÓN DE REGISTROS A EXPORTAR</h2>
          <button className="boton boton--secundario" onClick={descargarPDF}>
            <FileText size={16} /> DESCARGAR PDF ({casosFiltrados.length})
          </button>
        </div>

        <div className="tabla-contenedor">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>CÓDIGO</th>
                <th>FECHA</th>
                <th>REPORTANTE</th>
                <th>LOTE RESID.</th>
                <th>ETAPA</th>
                <th>CALLE PPAL.</th>
                <th>ÁREA</th>
                <th>ESTADO</th>
                <th>REGISTRADO POR</th>
              </tr>
            </thead>
            <tbody>
              {casosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '2rem' }}>
                    NO EXISTEN REGISTROS CON EL CRITERIO DE BÚSQUEDA
                  </td>
                </tr>
              ) : (
                casosPaginados.map((c) => {
                  const creador = usuarios.find((u) => u.id === c.registradoPor);
                  return (
                    <tr key={c.id}>
                      <td><strong>{c.codigo}</strong></td>
                      <td>{formatearFecha(c.fechaRecepcion)}</td>
                      <td>{c.reportanteNombre}</td>
                      <td>{c.reportanteLote || c.lote || '-'}</td>
                      <td>{c.etapa || '-'}</td>
                      <td>{c.callePrimaria || c.calle || '-'}</td>
                      <td>{c.area}</td>
                      <td>
                        <Insignia
                          texto={estados[c.estado]?.nombre || c.estado}
                          color={estados[c.estado]?.color || '#999'}
                        />
                      </td>
                      <td>
                        <span className="texto-tenue">
                          {creador ? `${creador.nombre} ${creador.apellido}` : `ID ${c.registradoPor}`}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN A 20 REGISTROS */}
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          alCambiarPagina={(pag) => setPaginaActual(pag)}
          totalRegistros={totalRegistros}
          porPagina={porPagina}
        />
      </section>
    </>
  );
}
