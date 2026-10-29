import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import {
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Layers,
  MapPin,
  FolderTree,
  Shield,
  Tag,
  ToggleLeft,
  ToggleRight,
  FilePlus2,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Paginador from '../componentes/Paginador';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useCatalogos } from '../contextos/ContextoCatalogos';
import { useToast } from '../contextos/ContextoToast';
import { esSuperusuario } from '../utilidades/permisos';
import { aMayusculas } from '../utilidades/texto';

/**
 * Catalogos
 * Gestión de los 5 catálogos independientes del sistema para el Superusuario:
 * Etapas, Lotes (NUMERO.SUBLOTE con carga masiva), Calles, Áreas y Categorías.
 * Conserva borrado lógico y paginación a 20 registros.
 */

export default function Catalogos() {
  const { usuario } = useSesion();
  const { todosLosCasos } = useCasos();
  const {
    etapas,
    calles,
    lotes,
    areas,
    categorias,
    crearItem,
    agregarVariosLotes,
    actualizarItem,
    toggleEstadoItem,
    eliminarItem,
  } = useCatalogos();
  const { mostrarToast } = useToast();

  if (!esSuperusuario(usuario)) {
    return <Navigate to="/" replace />;
  }

  const [tabActivo, setTabActivo] = useState('lotes'); // 'etapas' | 'lotes' | 'calles' | 'areas' | 'categorias'
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMasivoAbierto, setModalMasivoAbierto] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [nombreForm, setNombreForm] = useState('');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  // Estados para inserción masiva de lotes
  const [textoMasivo, setTextoMasivo] = useState('');
  const [resultadoMasivo, setResultadoMasivo] = useState(null);

  // Paginación a 20 registros por página
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  const catalogosMeta = {
    lotes: {
      titulo: 'CATASTRO DE LOTES (NUMERO.SUBLOTE)',
      singular: 'LOTE',
      lista: lotes,
      icono: <FolderTree size={16} />,
      ejemplo: 'EJ: 189.CASA1, 12.3, 520.0',
    },
    calles: {
      titulo: 'CALLES Y AVENIDAS (A-Z, PASAJES)',
      singular: 'CALLE',
      lista: calles,
      icono: <MapPin size={16} />,
      ejemplo: 'EJ: CALLE D, PASAJE 1, AV. COCO',
    },
    etapas: {
      titulo: 'ETAPAS DE LA URBANIZACIÓN',
      singular: 'ETAPA',
      lista: etapas,
      icono: <Layers size={16} />,
      ejemplo: 'EJ: ETAPA 1, ETAPA 2',
    },
    areas: {
      titulo: 'ÁREAS RESPONSABLES',
      singular: 'ÁREA',
      lista: areas,
      icono: <Shield size={16} />,
      ejemplo: 'EJ: MANTENIMIENTO, SEGURIDAD, ADMINISTRACIÓN',
    },
    categorias: {
      titulo: '10 CATEGORÍAS OFICIALES',
      singular: 'CATEGORÍA',
      lista: categorias,
      icono: <Tag size={16} />,
      ejemplo: 'EJ: 01 · MANTENIMIENTO E INFRAESTRUCTURA',
    },
  };

  const actual = catalogosMeta[tabActivo];

  // Filtrado de la lista activa por término de búsqueda
  const listaFiltrada = useMemo(() => {
    if (!busquedaCatalogo.trim()) return actual.lista;
    const term = busquedaCatalogo.toUpperCase().trim();
    return actual.lista.filter((item) => item.nombre.toUpperCase().includes(term));
  }, [actual.lista, busquedaCatalogo]);

  // Paginación sobre los elementos filtrados
  const totalRegistros = listaFiltrada.length;
  const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;
  const itemsPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return listaFiltrada.slice(inicio, inicio + porPagina);
  }, [listaFiltrada, paginaActual, porPagina]);

  function cambiarPestana(clave) {
    setTabActivo(clave);
    setBusquedaCatalogo('');
    setPaginaActual(1);
    setResultadoMasivo(null);
  }

  function abrirCrear() {
    setItemEditar(null);
    setNombreForm('');
    setErrorNombre('');
    setModalAbierto(true);
  }

  function abrirEditar(item) {
    setItemEditar(item);
    setNombreForm(item.nombre);
    setErrorNombre('');
    setModalAbierto(true);
  }

  function guardar(e) {
    e.preventDefault();
    if (!nombreForm.trim()) {
      setErrorNombre('EL NOMBRE NO PUEDE ESTAR VACÍO');
      mostrarToast('EL NOMBRE NO PUEDE ESTAR VACÍO', 'alerta');
      return;
    }

    if (itemEditar) {
      const res = actualizarItem(tabActivo, itemEditar.id, nombreForm);
      if (!res.exito) {
        setErrorNombre(res.mensaje);
        mostrarToast(res.mensaje, 'alerta');
        return;
      }
      mostrarToast(`${actual.singular} ACTUALIZADA`, 'exito');
    } else {
      const res = crearItem(tabActivo, nombreForm);
      if (!res.exito) {
        setErrorNombre(res.mensaje);
        mostrarToast(res.mensaje, 'alerta');
        return;
      }
      mostrarToast(`${actual.singular} REGISTRADA CON ÉXITO`, 'exito');
    }
    setModalAbierto(false);
  }

  function procesarCargaMasiva(e) {
    e.preventDefault();
    const res = agregarVariosLotes(textoMasivo);
    setResultadoMasivo(res);

    if (res.exito) {
      mostrarToast(`SE AGREGARON ${res.agregados} LOTES EXITOSAMENTE`, 'exito');
      setTextoMasivo('');
    } else {
      mostrarToast(res.mensaje || 'NO SE PUDO AGREGAR NINGÚN LOTE', 'alerta');
    }
  }

  function manejarEliminar(item) {
    const res = eliminarItem(tabActivo, item.id, todosLosCasos);
    mostrarToast(res.mensaje, res.tipo === 'logico' ? 'alerta' : 'exito');
  }

  function contarCasosVinculados(nombre) {
    const n = aMayusculas(nombre);
    const casos = todosLosCasos || [];
    if (tabActivo === 'etapas') {
      return casos.filter((c) => aMayusculas(c.etapa) === n).length;
    }
    if (tabActivo === 'calles') {
      return casos.filter(
        (c) =>
          aMayusculas(c.callePrimaria) === n ||
          aMayusculas(c.calleSecundaria) === n ||
          aMayusculas(c.calle) === n
      ).length;
    }
    if (tabActivo === 'lotes') {
      return casos.filter(
        (c) => aMayusculas(c.reportanteLote) === n || aMayusculas(c.lote) === n
      ).length;
    }
    if (tabActivo === 'areas') {
      return casos.filter((c) => aMayusculas(c.area) === n).length;
    }
    return casos.filter((c) => aMayusculas(c.categoria) === n).length;
  }

  return (
    <>
      <EncabezadoPagina
        titulo="CATÁLOGOS DEL SISTEMA (SUPERUSUARIO)"
        subtitulo="CASOOK · Gestión territorial independiente con validación estricta y borrado lógico"
      >
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {tabActivo === 'lotes' && (
            <button
              className="boton boton--secundario"
              onClick={() => {
                setResultadoMasivo(null);
                setModalMasivoAbierto(true);
              }}
            >
              <FilePlus2 size={17} /> AGREGAR VARIOS (UNO POR LÍNEA)
            </button>
          )}
          <button className="boton boton--primario" onClick={abrirCrear}>
            <Plus size={18} /> NUEVO {actual.singular}
          </button>
        </div>
      </EncabezadoPagina>

      <section className="tarjeta">
        {/* Pestañas de Catálogos */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem', borderBottom: '1px solid var(--color-borde)', paddingBottom: '0.75rem' }}>
          {Object.entries(catalogosMeta).map(([clave, config]) => (
            <button
              key={clave}
              type="button"
              className={`boton ${tabActivo === clave ? 'boton--primario' : 'boton--contorno'}`}
              style={{ fontSize: '0.82rem', padding: '0.45rem 0.75rem' }}
              onClick={() => cambiarPestana(clave)}
            >
              {config.icono}
              <span>{config.singular}S ({config.lista.length})</span>
            </button>
          ))}
        </div>

        {/* Buscador de catálogo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '420px' }}>
            <input
              type="search"
              className="campo-input"
              placeholder={`BUSCAR EN ${actual.singular}S...`}
              value={busquedaCatalogo}
              onChange={(e) => {
                setBusquedaCatalogo(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>
          <span className="texto-tenue">
            Total en catálogo: <strong>{totalRegistros}</strong> registros
          </span>
        </div>

        <p className="texto-tenue" style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          REGLA DE BORRADO LÓGICO: SI UN REGISTRO ESTÁ VINCULADO A NOVEDADES HISTÓRICAS, SE DESHABILITA PRESERVANDO LA INTEGRIDAD REFERENCIAL.
        </p>

        <div className="tabla-contenedor">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>NOMBRE DEL REGISTRO</th>
                <th>CASOS VINCULADOS</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {itemsPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    NO SE ENCONTRARON REGISTROS COINCIDENTES
                  </td>
                </tr>
              ) : (
                itemsPaginados.map((item) => {
                  const casosCount = contarCasosVinculados(item.nombre);
                  return (
                    <tr key={item.id}>
                      <td>
                        <strong>{item.nombre}</strong>
                        {item.descripcion && (
                          <span className="texto-tenue" style={{ display: 'block', fontSize: '0.74rem' }}>
                            {item.descripcion}
                          </span>
                        )}
                      </td>
                      <td>
                        <span className="texto-tenue">{casosCount} caso(s)</span>
                      </td>
                      <td>
                        {item.estado ? (
                          <span className="insignia-estado-activo">HABILITADO</span>
                        ) : (
                          <span className="insignia-estado-inactivo">INACTIVO</span>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                          <button
                            type="button"
                            className="boton boton--contorno"
                            style={{ padding: '0.3rem 0.5rem' }}
                            onClick={() => abrirEditar(item)}
                            title="Editar registro"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="boton boton--contorno"
                            style={{ padding: '0.3rem 0.5rem' }}
                            onClick={() => {
                              toggleEstadoItem(tabActivo, item.id);
                              mostrarToast('ESTADO DEL REGISTRO CAMBIADO', 'info');
                            }}
                            title={item.estado ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {item.estado ? (
                              <ToggleRight size={15} style={{ color: 'var(--color-secundario)' }} />
                            ) : (
                              <ToggleLeft size={15} />
                            )}
                          </button>
                          <button
                            type="button"
                            className="boton boton--contorno"
                            style={{ padding: '0.3rem 0.5rem', color: 'var(--color-alerta)' }}
                            onClick={() => manejarEliminar(item)}
                            title="Eliminar (físico si no tiene casos, lógico si tiene casos)"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador a máximo 20 registros */}
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          alCambiarPagina={(p) => setPaginaActual(p)}
          totalRegistros={totalRegistros}
          porPagina={porPagina}
        />
      </section>

      {/* MODAL CREAR / EDITAR INDIVIDUAL */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>
                {itemEditar
                  ? `EDITAR ${actual.singular}`
                  : `NUEVO ${actual.singular}`}
              </h2>
              <button
                type="button"
                className="boton boton--contorno"
                onClick={() => setModalAbierto(false)}
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <form className="formulario" onSubmit={guardar} noValidate>
              <CampoEntrada
                label={`NOMBRE DEL REGISTRO (${actual.singular})`}
                requerido
                valor={nombreForm}
                onChange={(e) => {
                  setNombreForm(aMayusculas(e.target.value));
                  if (errorNombre) setErrorNombre('');
                }}
                error={errorNombre}
                placeholder={actual.ejemplo}
              />

              {tabActivo === 'lotes' && (
                <span className="texto-tenue" style={{ fontSize: '0.78rem', marginTop: '-0.3rem' }}>
                  Nomenclatura requerida: NUMERO.SUBLOTE (ejemplos válidos: 12.3, 520.0, 189.CASA1, 185.SUITE2).
                </span>
              )}

              {tabActivo === 'calles' && (
                <span className="texto-tenue" style={{ fontSize: '0.78rem', marginTop: '-0.3rem' }}>
                  Solo mayúsculas, letras, números, puntos y espacios.
                </span>
              )}

              <div className="acciones" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="boton boton--contorno"
                  onClick={() => setModalAbierto(false)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="boton boton--primario">
                  <Check size={16} /> GUARDAR
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL INSERCIÓN MASIVA DE LOTES */}
      {modalMasivoAbierto && (
        <div className="modal-overlay">
          <div className="modal-contenido" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>AGREGAR VARIOS LOTES (UNO POR LÍNEA)</h2>
              <button
                type="button"
                className="boton boton--contorno"
                onClick={() => setModalMasivoAbierto(false)}
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={16} />
              </button>
            </div>

            <p className="texto-tenue" style={{ marginBottom: '0.75rem' }}>
              Pegue o escriba un lote por línea con formato <strong>NUMERO.SUBLOTE</strong> (ej: 12.3, 520.0, 189.CASA1, 185.SUITE2).
              El sistema validará el formato, omitirá duplicados y ordenará los lotes naturalmente.
            </p>

            <form className="formulario" onSubmit={procesarCargaMasiva}>
              <div className="campo-grupo">
                <label className="campo-label">LISTA DE LOTES (UNO POR LÍNEA) *</label>
                <textarea
                  rows={8}
                  className="campo-input"
                  style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                  placeholder={`189.CASA1\n189.CASA2\n520.0\n12.3\n185.SUITE2`}
                  value={textoMasivo}
                  onChange={(e) => setTextoMasivo(e.target.value)}
                  required
                />
              </div>

              {/* Reporte de resultados de la inserción */}
              {resultadoMasivo && (
                <div
                  style={{
                    padding: '0.85rem',
                    borderRadius: 'var(--radio)',
                    background: resultadoMasivo.exito ? '#f0fdf4' : '#fff1f2',
                    border: `1px solid ${resultadoMasivo.exito ? '#bbf7d0' : '#fecdd3'}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    fontSize: '0.85rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800 }}>
                    {resultadoMasivo.exito ? (
                      <CheckCircle size={16} style={{ color: 'var(--color-secundario)' }} />
                    ) : (
                      <AlertTriangle size={16} style={{ color: 'var(--color-alerta)' }} />
                    )}
                    <span>
                      {resultadoMasivo.agregados > 0
                        ? `Se agregaron ${resultadoMasivo.agregados} lotes válidos.`
                        : 'No se agregaron registros.'}
                    </span>
                  </div>

                  {resultadoMasivo.duplicados?.length > 0 && (
                    <div style={{ color: '#b45309' }}>
                      ⚠ <strong>{resultadoMasivo.duplicados.length} duplicado(s) omitido(s):</strong>{' '}
                      {resultadoMasivo.duplicados.slice(0, 5).join(', ')}
                      {resultadoMasivo.duplicados.length > 5 ? '...' : ''}
                    </div>
                  )}

                  {resultadoMasivo.invalidos?.length > 0 && (
                    <div style={{ color: '#dc2626' }}>
                      ✕ <strong>{resultadoMasivo.invalidos.length} línea(s) con formato inválido:</strong>{' '}
                      {resultadoMasivo.invalidos.slice(0, 5).join(', ')}
                      {resultadoMasivo.invalidos.length > 5 ? '...' : ''}
                    </div>
                  )}
                </div>
              )}

              <div className="acciones" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  className="boton boton--contorno"
                  onClick={() => setModalMasivoAbierto(false)}
                >
                  CERRAR
                </button>
                <button type="submit" className="boton boton--primario">
                  <Check size={16} /> VALIDAR Y AGREGAR LOTES
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
