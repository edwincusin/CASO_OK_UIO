import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit3, X, Save } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import TarjetaCaso from '../componentes/TarjetaCaso';
import Paginador from '../componentes/Paginador';
import AutocompleteLote from '../componentes/AutocompleteLote';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { estados } from '../datos/datosDemo';
import { puedeEditarCaso } from '../utilidades/permisos';
import { aMayusculas } from '../utilidades/texto';
import { soloLetras } from '../utilidades/validaciones';

/**
 * Casos
 * Listado general de casos con filtros por búsqueda, estado, prioridad y etapa.
 * Paginación a 20 registros por página y edición restringida a casos en proceso.
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

  // Paginación (Máximo 20 por página)
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  // Modal de edición restringida
  const [casoParaEditar, setCasoParaEditar] = useState(null);
  const [formEdicion, setFormEdicion] = useState({});

  const casosFiltrados = useMemo(() => {
    return casos.filter((caso) => {
      const textoCaso = `${caso.codigo} ${caso.reportanteNombre} ${caso.reportanteLote || ''} ${caso.callePrimaria || ''} ${caso.calle || ''} ${caso.descripcion} ${caso.area} ${caso.etapa || ''}`.toLowerCase();
      const coincideTexto = textoCaso.includes(textoBusqueda.toLowerCase());
      const coincideEstado = estadoFiltro === '' || caso.estado === estadoFiltro;
      const coincidePrioridad = prioridadFiltro === '' || caso.prioridad === prioridadFiltro;
      const coincideEtapa = etapaFiltro === '' || caso.etapa === etapaFiltro;
      return coincideTexto && coincideEstado && coincidePrioridad && coincideEtapa;
    });
  }, [casos, textoBusqueda, estadoFiltro, prioridadFiltro, etapaFiltro]);

  // Cálculo de paginación
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
    <>
      <EncabezadoPagina titulo="CASOS REGISTRADOS" subtitulo="Gestión y seguimiento de novedades en CASOOK">
        <Link to="/casos/nuevo" className="boton boton--primario">
          <Plus size={18} /> NUEVA NOVEDAD
        </Link>
      </EncabezadoPagina>

      <div className="filtros">
        <input
          className="tarjeta"
          type="search"
          placeholder="BUSCAR POR CÓDIGO, RESIDENTE, LOTE, ETAPA, DESCRIPCIÓN..."
          value={textoBusqueda}
          onChange={(e) => {
            setTextoBusqueda(e.target.value);
            setPaginaActual(1);
          }}
        />
        <select
          className="tarjeta"
          value={estadoFiltro}
          onChange={(e) => {
            setEstadoFiltro(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">TODOS LOS ESTADOS</option>
          {Object.entries(estados).map(([clave, est]) => (
            <option key={clave} value={clave}>
              {est.nombre}
            </option>
          ))}
        </select>
        <select
          className="tarjeta"
          value={etapaFiltro}
          onChange={(e) => {
            setEtapaFiltro(e.target.value);
            setPaginaActual(1);
          }}
        >
          <option value="">TODAS LAS ETAPAS</option>
          {etapas.map((etapa) => (
            <option key={etapa.id} value={etapa.nombre}>
              {etapa.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="lista">
        {casosFiltrados.length === 0 && (
          <p className="vacio">NO SE ENCONTRARON CASOS SEGÚN LOS FILTROS SELECCIONADOS.</p>
        )}
        {casosPaginados.map((caso) => (
          <div key={caso.id} style={{ position: 'relative' }}>
            <TarjetaCaso caso={caso} />
            {puedeEditarCaso(usuario, caso) && (
              <button
                type="button"
                className="boton boton--contorno"
                style={{
                  position: 'absolute',
                  top: '0.75rem',
                  right: '5.5rem',
                  padding: '0.25rem 0.5rem',
                  fontSize: '0.75rem',
                  zIndex: 2,
                  background: 'var(--color-superficie)',
                }}
                onClick={(e) => abrirEdicion(e, caso)}
                title="Editar reporte (permitido por estar en proceso)"
              >
                <Edit3 size={13} /> EDITAR
              </button>
            )}
          </div>
        ))}
      </div>

      {/* PAGINADOR (MÁXIMO 20 REGISTROS) */}
      <Paginador
        paginaActual={paginaActual}
        totalPaginas={totalPaginas}
        alCambiarPagina={(pag) => setPaginaActual(pag)}
        totalRegistros={totalRegistros}
        porPagina={porPagina}
      />

      {/* MODAL DE EDICIÓN RESTRINGIDA */}
      {casoParaEditar && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>EDITAR CASO: {casoParaEditar.codigo}</h2>
              <button
                type="button"
                className="boton boton--contorno"
                onClick={() => setCasoParaEditar(null)}
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>
            <p className="texto-tenue" style={{ marginBottom: '1rem' }}>
              REGLA DE NEGOCIO: CASO EN ESTADO EN PROCESO Y MODIFICADO POR EL CREADOR ORIGINAL O SUPERUSUARIO.
            </p>

            <form className="formulario" onSubmit={guardarEdicion}>
              <div className="grid-2">
                <CampoEntrada
                  label="NOMBRES Y APELLIDOS REPORTANTE"
                  name="reportanteNombre"
                  requerido
                  valor={formEdicion.reportanteNombre || ''}
                  onChange={(e) =>
                    setFormEdicion({ ...formEdicion, reportanteNombre: soloLetras(aMayusculas(e.target.value)) })
                  }
                />
                <AutocompleteLote
                  lotes={lotes}
                  valorSeleccionado={formEdicion.reportanteLote || ''}
                  alSeleccionar={(nombreLote) => setFormEdicion({ ...formEdicion, reportanteLote: nombreLote })}
                />
              </div>

              <div className="grid-3">
                <div className="campo-grupo">
                  <label className="campo-label">ETAPA *</label>
                  <select
                    className="campo-input"
                    value={formEdicion.etapa || ''}
                    onChange={(e) => setFormEdicion({ ...formEdicion, etapa: e.target.value })}
                  >
                    <option value="">SELECCIONE ETAPA...</option>
                    {etapas.map((et) => (
                      <option key={et.id} value={et.nombre}>
                        {et.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo-grupo">
                  <label className="campo-label">CALLE PRIMARIA *</label>
                  <select
                    className="campo-input"
                    value={formEdicion.callePrimaria || ''}
                    onChange={(e) => setFormEdicion({ ...formEdicion, callePrimaria: e.target.value })}
                  >
                    <option value="">CALLE PRIMARIA...</option>
                    {calles.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="campo-grupo">
                  <label className="campo-label">CALLE SECUNDARIA</label>
                  <select
                    className="campo-input"
                    value={formEdicion.calleSecundaria || ''}
                    onChange={(e) => setFormEdicion({ ...formEdicion, calleSecundaria: e.target.value })}
                  >
                    <option value="">CALLE SECUNDARIA...</option>
                    {calles.map((c) => (
                      <option key={c.id} value={c.nombre}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <CampoEntrada
                label="REFERENCIA DE UBICACIÓN"
                valor={formEdicion.referenciaUbicacion || ''}
                onChange={(e) =>
                  setFormEdicion({ ...formEdicion, referenciaUbicacion: aMayusculas(e.target.value) })
                }
              />

              <div className="grid-2">
                <div className="campo-grupo">
                  <label className="campo-label">CATEGORÍA</label>
                  <select
                    className="campo-input"
                    value={formEdicion.categoria || ''}
                    onChange={(e) => setFormEdicion({ ...formEdicion, categoria: e.target.value })}
                  >
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
                    value={formEdicion.area || ''}
                    onChange={(e) => setFormEdicion({ ...formEdicion, area: e.target.value })}
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
                <label className="campo-label">DESCRIPCIÓN DE LA NOVEDAD *</label>
                <textarea
                  className="campo-input"
                  rows={3}
                  required
                  value={formEdicion.descripcion || ''}
                  onChange={(e) =>
                    setFormEdicion({ ...formEdicion, descripcion: aMayusculas(e.target.value) })
                  }
                />
              </div>

              <div className="acciones" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="boton boton--contorno"
                  onClick={() => setCasoParaEditar(null)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="boton boton--primario">
                  <Save size={16} /> GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
