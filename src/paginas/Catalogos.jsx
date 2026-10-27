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
  Search,
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
    actualizarItem,
    toggleEstadoItem,
    eliminarItem,
  } = useCatalogos();
  const { mostrarToast } = useToast();

  if (!esSuperusuario(usuario)) {
    return <Navigate to="/" replace />;
  }

  const [tabActivo, setTabActivo] = useState('etapas'); // 'etapas' | 'lotes' | 'calles' | 'areas' | 'categorias'
  const [modalAbierto, setModalAbierto] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [nombreForm, setNombreForm] = useState('');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  // Paginación a 20 registros por página
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  const catalogosMeta = {
    etapas: {
      titulo: 'ETAPAS DE LA URBANIZACIÓN',
      singular: 'ETAPA',
      lista: etapas,
      icono: <Layers size={16} />,
      ejemplo: 'EJ: ETAPA 4',
    },
    lotes: {
      titulo: 'CATASTRO DE LOTES (3,000+ PREDIOS)',
      singular: 'LOTE',
      lista: lotes,
      icono: <FolderTree size={16} />,
      ejemplo: 'EJ: LOTE 509.2',
    },
    calles: {
      titulo: 'CALLES Y AVENIDAS',
      singular: 'CALLE',
      lista: calles,
      icono: <MapPin size={16} />,
      ejemplo: 'EJ: AVENIDA SAN CARLOS',
    },
    areas: {
      titulo: 'ÁREAS QUE ATIENDEN',
      singular: 'ÁREA',
      lista: areas,
      icono: <Shield size={16} />,
      ejemplo: 'EJ: OPERACIONES',
    },
    categorias: {
      titulo: 'CATEGORÍAS DE INCIDENCIAS',
      singular: 'CATEGORÍA',
      lista: categorias,
      icono: <Tag size={16} />,
      ejemplo: 'EJ: ALCANTARILLADO',
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
      actualizarItem(tabActivo, itemEditar.id, nombreForm);
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
        subtitulo="Quinde Control · Gestión territorial paginada con borrado lógico"
      >
        <button className="boton boton--primario" onClick={abrirCrear}>
          <Plus size={18} /> NUEVA {actual.singular}
        </button>
      </EncabezadoPagina>

      <section className="tarjeta">
        {/* BARRA DE PESTAÑAS PARA LOS 5 CATÁLOGOS */}
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

        {/* BUSCADOR DE CATÁLOGO */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
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
          REGLA DE BORRADO LÓGICO V4.0: SI UN REGISTRO ESTÁ VINCULADO A NOVEDADES HISTÓRICAS, SE DESHABILITA PRESERVANDO LA INTEGRIDAD REFERENCIAL.
        </p>

        <div className="tabla-contenedor">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>NOMBRE DEL REGISTRO</th>
                {tabActivo === 'lotes' && <th>ETAPA ASOCIADA</th>}
                <th>CASOS VINCULADOS</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {itemsPaginados.length === 0 ? (
                <tr>
                  <td colSpan={tabActivo === 'lotes' ? 5 : 4} style={{ textAlign: 'center', padding: '2rem' }}>
                    NO SE ENCONTRARON REGISTROS COINCIDENTES
                  </td>
                </tr>
              ) : (
                itemsPaginados.map((item) => {
                  const casosCount = contarCasosVinculados(item.nombre);
                  return (
                    <tr key={item.id}>
                      <td><strong>{item.nombre}</strong></td>
                      {tabActivo === 'lotes' && (
                        <td>
                          <span className="texto-tenue">{item.etapa || 'GENERAL'}</span>
                        </td>
                      )}
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
                            title="Editar nombre"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="boton boton--contorno"
                            style={{ padding: '0.3rem 0.5rem' }}
                            onClick={() => {
                              toggleEstadoItem(tabActivo, item.id);
                              mostrarToast('ESTADO CAMBIADO', 'info');
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

        {/* PAGINADOR A MÁXIMO 20 REGISTROS */}
        <Paginador
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          alCambiarPagina={(p) => setPaginaActual(p)}
          totalRegistros={totalRegistros}
          porPagina={porPagina}
        />
      </section>

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="modal-overlay">
          <div className="modal-contenido">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>
                {itemEditar
                  ? `EDITAR ${actual.singular}`
                  : `NUEVA ${actual.singular}`}
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
    </>
  );
}
