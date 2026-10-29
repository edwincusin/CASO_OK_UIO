import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Edit3,
  X,
  Save,
  Search,
  LayoutGrid,
  List,
  Eye,
  AlertCircle,
} from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaCaso from '../componentes/TarjetaCaso';
import Paginador from '../componentes/Paginador';
import AutocompleteLote from '../componentes/AutocompleteLote';
import CampoEntrada from '../componentes/CampoEntrada';
import Insignia from '../componentes/Insignia';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { estados } from '../datos/datosDemo';
import { puedeEditarCaso } from '../utilidades/permisos';
import { aMayusculas } from '../utilidades/texto';
import { soloLetras } from '../utilidades/validaciones';
import { formatearFecha } from '../utilidades/fechas';

/**
 * Casos
 * Listado general de casos con barra de filtros compacta, alternancia de vista
 * cuadrícula / tabla (con data-label apilada en móvil <= 768px) y paginación de 20 por página.
 */
export default function Casos() {
  const { usuario } = useSesion();
  const { casos, actualizarCaso } = useCasos();
  const { etapas, calles, lotes, categorias, areas } = useCatalogos();
  const { mostrarToast } = useToast();

  const [textoBusqueda, setTextoBusqueda] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [prioridadFiltro, setPrioridadFiltro] = useState('');
  const [etapaFiltro, setEtapaFiltro] = useState('');
  const [vista, setVista] = useState('cuadricula'); // 'cuadricula' o 'tabla'

  // Paginación (Máximo 20 por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  // Modal de edición restringida
  const [casoParaEditar, setCasoParaEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState({});

  const casosFiltrados = useMemo(() => {
    return casos.filter((caso) => {
      const textoCaso = `${caso.codigo} ${caso.reportanteNombre} ${caso.reportanteLote || ''} ${
        caso.callePrimaria || ''
      } ${caso.calle || ''} ${caso.descripcion} ${caso.area} ${caso.etapa || ''}`.toLowerCase();
      const coincideTexto = textoCaso.includes(textoBusqueda.toLowerCase());
      const coincideEstado = estadoFiltro === '' || caso.estado === estadoFiltro;
      const coincidePrioridad = prioridadFiltro === '' || caso.prioridad === prioridadFiltro;
      const coincideEtapa = etapaFiltro === '' || caso.etapa === etapaFiltro;
      return coincideTexto && coincideEstado && coincidePrioridad && coincideEtapa;
    });
  }, [casos, textoBusqueda, estadoFiltro, prioridadFiltro, etapaFiltro]);

  const totalRegistros = casosFiltrados.length;
  const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;
  const casosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return casosFiltrados.slice(inicio, inicio + porPagina);
  }, [casosFiltrados, paginaActual, porPagina]);

  function abrirEdicion(e, caso) {
    e.preventDefault();
    e.stopPropagation();
    setCasoParaEditar(caso);
    setFormEdicion({
      reportanteNombre: caso.reportanteNombre,
      reportanteTipo: caso.reportanteTipo || 'PROPIETARIO',
      reportanteLote: caso.reportanteLote || caso.lote || '',
      reportanteContacto: caso.reportanteContacto || '',
      etapa: caso.etapa || '',
      callePrimaria: caso.callePrimaria || caso.calle || '',
      calleSecundaria: caso.calleSecundaria || '',
      referenciaUbicacion: caso.referenciaUbicacion || caso.ubicacionTexto || '',
      categoria: caso.categoria,
      area: caso.area,
      prioridad: caso.prioridad,
      descripcion: caso.descripcion,
    });
  }

  function guardarEdicion(e) {
    e.preventDefault();
    const res = actualizarCaso(casoParaEditar.id, formEdicion, usuario);
    if (res.exito) {
      mostrarToast(res.mensaje, 'exito');
      setCasoParaEditar(null);
    } else {
      mostrarToast(res.mensaje, 'alerta');
    }
  }

  return (
    <div className="pagina-casos">
      <EncabezadoPagina
        titulo="Casos Registrados"
        subtitulo="Gestión, seguimiento y resolución de novedades comunitarias"
      >
        <Link to="/casos/nuevo" className="boton boton--primario">
          <Plus size={18} />
          <span>Nueva Novedad</span>
        </Link>
      </EncabezadoPagina>

      {/* BARRA DE FILTROS COMPACTA */}
      <section className="barra-filtros">
        <div className="campo-con-icono">
          <span className="campo-con-icono__icono">
            <Search size={18} />
          </span>
          <input
            className="campo-input"
            type="search"
            placeholder="Buscar por código, residente, lote, etapa o descripción..."
            value={textoBusqueda}
            onChange={(e) => {
              setTextoBusqueda(e.target.value);
              setPaginaActual(1);
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div className="barra-filtros__grid" style={{ flex: 1 }}>
            <select
              className="campo-select"
              value={estadoFiltro}
              onChange={(e) => {
                setEstadoFiltro(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="">Todos los estados</option>
              {Object.entries(estados).map(([clave, est]) => (
                <option key={clave} value={clave}>
                  {est.nombre}
                </option>
              ))}
            </select>

            <select
              className="campo-select"
              value={etapaFiltro}
              onChange={(e) => {
                setEtapaFiltro(e.target.value);
                setPaginaActual(1);
              }}
            >
              <option value="">Todas las etapas</option>
              {etapas.map((etapa) => (
                <option key={etapa.id} value={etapa.nombre}>
                  {etapa.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle de vistas Cuadrícula / Tabla */}
          <div className="casos-vistas-toggle" role="group" aria-label="Vista de casos">
            <button
              type="button"
              className={`casos-vistas-toggle__btn ${
                vista === 'cuadricula' ? 'casos-vistas-toggle__btn--activo' : ''
              }`}
              onClick={() => setVista('cuadricula')}
              title="Vista de cuadrícula de tarjetas"
            >
              <LayoutGrid size={16} />
              <span>Tarjetas</span>
            </button>
            <button
              type="button"
              className={`casos-vistas-toggle__btn ${
                vista === 'tabla' ? 'casos-vistas-toggle__btn--activo' : ''
              }`}
              onClick={() => setVista('tabla')}
              title="Vista de tabla detallada"
            >
              <List size={16} />
              <span>Tabla</span>
            </button>
          </div>
        </div>
      </section>

      {/* CONTENIDO: TARJETAS O TABLA */}
      {casosFiltrados.length === 0 ? (
        <div className="tarjeta estado-vacio">
          <AlertCircle size={36} className="texto-tenue" />
          <h2 className="estado-vacio__titulo">No se encontraron casos</h2>
          <p className="estado-vacio__texto">
            Ningún registro coincide con los criterios de búsqueda aplicados.
          </p>
        </div>
      ) : vista === 'cuadricula' ? (
        <div className="casos-cuadricula-tarjetas">
          {casosPaginados.map((caso, index) => (
            <div
              key={caso.id}
              className="animar-escalonado"
              style={{ position: 'relative', '--i': index % 20 }}
            >
              <TarjetaCaso caso={caso} />
              {puedeEditarCaso(usuario, caso) && (
                <button
                  type="button"
                  className="boton boton--sm boton--secundario"
                  style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    padding: '0 8px',
                    minHeight: '28px',
                    zIndex: 2,
                  }}
                  onClick={(e) => abrirEdicion(e, caso)}
                  title="Editar reporte de novedad"
                >
                  <Edit3 size={12} />
                  <span>Editar</span>
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* TABLA RESPONSIVA QUE EN MÓVIL (<= 768px) SE CONVIERTE EN TARJETAS CON data-label */
        <div className="contenedor-tabla">
          <table className="tabla-datos tabla-responsiva-apilada">
            <thead>
              <tr>
                <th>Código</th>
                <th>Fecha</th>
                <th>Reportante</th>
                <th>Lote</th>
                <th>Etapa</th>
                <th>Descripción</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {casosPaginados.map((caso) => (
                <tr key={caso.id}>
                  <td data-label="Código" className="columna-codigo">
                    <Link to={`/casos/${caso.id}`} style={{ color: 'inherit' }}>
                      {caso.codigo}
                    </Link>
                  </td>
                  <td data-label="Fecha" className="texto-mono">
                    {formatearFecha(caso.fechaRecepcion)}
                  </td>
                  <td data-label="Reportante">{caso.reportanteNombre}</td>
                  <td data-label="Lote" className="texto-mono">
                    {caso.reportanteLote || caso.lote || '—'}
                  </td>
                  <td data-label="Etapa">{caso.etapa || '—'}</td>
                  <td data-label="Descripción">
                    <span className="texto-truncado">{caso.descripcion}</span>
                  </td>
                  <td data-label="Estado">
                    <Insignia
                      texto={
                        estados[caso.estado]?.nombre || (caso.estado || '').toUpperCase()
                      }
                      variante={caso.estado}
                      color={estados[caso.estado]?.color}
                    />
                  </td>
                  <td data-label="Acciones">
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <Link
                        to={`/casos/${caso.id}`}
                        className="boton boton--sm boton--fantasma"
                        title="Ver detalle del caso"
                      >
                        <Eye size={14} />
                      </Link>
                      {puedeEditarCaso(usuario, caso) && (
                        <button
                          type="button"
                          className="boton boton--sm boton--secundario"
                          onClick={(e) => abrirEdicion(e, caso)}
                          title="Editar caso"
                        >
                          <Edit3 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* PAGINADOR (20 POR PÁGINA) */}
      <Paginador
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        alCambiarPagina={(pag) => setPaginaActual(pag)}
        totalRegistros={totalRegistros}
        porPagina={porPagina}
      />

      {/* MODAL DE EDICIÓN RESTRINGIDA */}
      {casoParaEditar && (
        <div className="modal-fondo">
          <div className="modal-contenedor">
            <div className="modal-cabecera">
              <h2 className="modal-titulo">Editar Caso: {casoParaEditar.codigo}</h2>
              <button
                type="button"
                className="modal-btn-cerrar"
                onClick={() => setCasoParaEditar(null)}
                aria-label="Cerrar ventana de edición"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <p className="texto-tenue">
                Edición habilitada para novedades en estado En Proceso modificadas por el creador original o superusuario.
              </p>

              <form className="formulario" onSubmit={guardarEdicion}>
                <div className="grid-formulario-2">
                  <CampoEntrada
                    label="Nombres y Apellidos Reportante"
                    name="reportanteNombre"
                    requerido
                    valor={formEdicion.reportanteNombre || ''}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        reportanteNombre: soloLetras(aMayusculas(e.target.value)),
                      })
                    }
                  />
                  <AutocompleteLote
                    lotes={lotes}
                    valorSeleccionado={formEdicion.reportanteLote || ''}
                    alSeleccionar={(nombreLote) =>
                      setFormEdicion({ ...formEdicion, reportanteLote: nombreLote })
                    }
                  />
                </div>

                <div className="grid-formulario-3">
                  <div className="campo-grupo">
                    <label className="campo-label">Etapa *</label>
                    <select
                      className="campo-select"
                      value={formEdicion.etapa || ''}
                      onChange={(e) =>
                        setFormEdicion({ ...formEdicion, etapa: e.target.value })
                      }
                    >
                      <option value="">Seleccione etapa...</option>
                      {etapas.map((et) => (
                        <option key={et.id} value={et.nombre}>
                          {et.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Calle Primaria *</label>
                    <select
                      className="campo-select"
                      value={formEdicion.callePrimaria || ''}
                      onChange={(e) =>
                        setFormEdicion({ ...formEdicion, callePrimaria: e.target.value })
                      }
                    >
                      <option value="">Calle primaria...</option>
                      {calles.map((c) => (
                        <option key={c.id} value={c.nombre}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Calle Secundaria</label>
                    <select
                      className="campo-select"
                      value={formEdicion.calleSecundaria || ''}
                      onChange={(e) =>
                        setFormEdicion({ ...formEdicion, calleSecundaria: e.target.value })
                      }
                    >
                      <option value="">Calle secundaria...</option>
                      {calles.map((c) => (
                        <option key={c.id} value={c.nombre}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <CampoEntrada
                  label="Referencia de Ubicación"
                  valor={formEdicion.referenciaUbicacion || ''}
                  onChange={(e) =>
                    setFormEdicion({
                      ...formEdicion,
                      referenciaUbicacion: aMayusculas(e.target.value),
                    })
                  }
                />

                <div className="grid-formulario-2">
                  <div className="campo-grupo">
                    <label className="campo-label">Categoría</label>
                    <select
                      className="campo-select"
                      value={formEdicion.categoria || ''}
                      onChange={(e) =>
                        setFormEdicion({ ...formEdicion, categoria: e.target.value })
                      }
                    >
                      {categorias.map((c) => (
                        <option key={c.id} value={c.nombre}>
                          {c.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="campo-grupo">
                    <label className="campo-label">Área Responsable</label>
                    <select
                      className="campo-select"
                      value={formEdicion.area || ''}
                      onChange={(e) =>
                        setFormEdicion({ ...formEdicion, area: e.target.value })
                      }
                    >
                      {areas.map((a) => (
                        <option key={a.id} value={a.nombre}>
                          {a.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="campo-grupo">
                  <label className="campo-label">Descripción de la Novedad *</label>
                  <textarea
                    className="campo-textarea"
                    rows={3}
                    required
                    value={formEdicion.descripcion || ''}
                    onChange={(e) =>
                      setFormEdicion({
                        ...formEdicion,
                        descripcion: aMayusculas(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="modal-pie" style={{ padding: 0, background: 'transparent' }}>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => setCasoParaEditar(null)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton boton--primario">
                    <Save size={16} />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
