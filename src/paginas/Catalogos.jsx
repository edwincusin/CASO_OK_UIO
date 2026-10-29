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
 * Gestión de los catálogos del sistema para el Superusuario:
 * Lotes (NUMERO.SUBLOTE con carga masiva), Calles, Etapas, Áreas y Categorías.
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

  const [tabActivo, setTabActivo] = useState('lotes');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalMasivoAbierto, setModalMasivoAbierto] = useState(false);
  const [itemEditar, setItemEditar] = useState(null);
  const [nombreForm, setNombreForm] = useState('');
  const [busquedaCatalogo, setBusquedaCatalogo] = useState('');
  const [errorNombre, setErrorNombre] = useState('');

  const [textoMasivo, setTextoMasivo] = useState('');
  const [resultadoMasivo, setResultadoMasivo] = useState(null);

  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;

  const catalogosMeta = {
    lotes: {
      titulo: 'Catastro de Lotes (NUMERO.SUBLOTE)',
      singular: 'Lote',
      lista: lotes,
      icono: <FolderTree size={16} />,
      ejemplo: 'Ej: 189.CASA1, 12.3, 520.0',
    },
    calles: {
      titulo: 'Calles y Avenidas',
      singular: 'Calle',
      lista: calles,
      icono: <MapPin size={16} />,
      ejemplo: 'Ej: Calle D, Pasaje 1, Av. Coco',
    },
    etapas: {
      titulo: 'Etapas de la Urbanización',
      singular: 'Etapa',
      lista: etapas,
      icono: <Layers size={16} />,
      ejemplo: 'Ej: Etapa 1, Etapa 2',
    },
    areas: {
      titulo: 'Áreas Responsables',
      singular: 'Área',
      lista: areas,
      icono: <Shield size={16} />,
      ejemplo: 'Ej: Mantenimiento, Seguridad, Administración',
    },
    categorias: {
      titulo: '10 Categorías Oficiales',
      singular: 'Categoría',
      lista: categorias,
      icono: <Tag size={16} />,
      ejemplo: 'Ej: 01 · Mantenimiento e Infraestructura',
    },
  };

  const actual = catalogosMeta[tabActivo];

  const listaFiltrada = useMemo(() => {
    if (!busquedaCatalogo.trim()) return actual.lista;
    const term = busquedaCatalogo.toUpperCase().trim();
    return actual.lista.filter((item) => item.nombre.toUpperCase().includes(term));
  }, [actual.lista, busquedaCatalogo]);

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
      setErrorNombre('El nombre no puede estar vacío');
      mostrarToast('El nombre no puede estar vacío', 'alerta');
      return;
    }

    if (itemEditar) {
      const res = actualizarItem(tabActivo, itemEditar.id, nombreForm);
      if (!res.exito) {
        setErrorNombre(res.mensaje);
        mostrarToast(res.mensaje, 'alerta');
        return;
      }
      mostrarToast(`${actual.singular} actualizada`, 'exito');
    } else {
      const res = crearItem(tabActivo, nombreForm);
      if (!res.exito) {
        setErrorNombre(res.mensaje);
        mostrarToast(res.mensaje, 'alerta');
        return;
      }
      mostrarToast(`${actual.singular} registrada con éxito`, 'exito');
    }
    setModalAbierto(false);
  }

  function procesarCargaMasiva(e) {
    e.preventDefault();
    const res = agregarVariosLotes(textoMasivo);
    setResultadoMasivo(res);

    if (res.exito) {
      mostrarToast(`Se agregaron ${res.agregados} lotes exitosamente`, 'exito');
      setTextoMasivo('');
    } else {
      mostrarToast(res.mensaje || 'No se pudo agregar ningún lote', 'alerta');
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
    <div className="pagina-catalogos">
      <EncabezadoPagina
        titulo="Catálogos del Sistema"
        subtitulo="Gestión territorial independiente con validación estricta y borrado lógico"
      >
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {tabActivo === 'lotes' && (
            <button
              type="button"
              className="boton boton--secundario"
              onClick={() => {
                setResultadoMasivo(null);
                setModalMasivoAbierto(true);
              }}
            >
              <FilePlus2 size={17} />
              <span>Carga Masiva de Lotes</span>
            </button>
          )}
          <button type="button" className="boton boton--primario" onClick={abrirCrear}>
            <Plus size={18} />
            <span>Nuevo {actual.singular}</span>
          </button>
        </div>
      </EncabezadoPagina>

      <section className="tarjeta">
        {/* Pestañas de Catálogos */}
        <div className="catalogos-pestanas">
          {Object.entries(catalogosMeta).map(([clave, config]) => (
            <button
              key={clave}
              type="button"
              className={`catalogos-pestanas__btn ${
                tabActivo === clave ? 'catalogos-pestanas__btn--activa' : ''
              }`}
              onClick={() => cambiarPestana(clave)}
            >
              {config.singular}s ({config.lista.length})
            </button>
          ))}
        </div>

        {/* Buscador de catálogo */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            margin: '16px 0 12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, maxWidth: '420px' }}>
            <input
              type="search"
              className="campo-input"
              placeholder={`Buscar en ${actual.singular}s...`}
              value={busquedaCatalogo}
              onChange={(e) => {
                setBusquedaCatalogo(e.target.value);
                setPaginaActual(1);
              }}
            />
          </div>
          <span className="texto-tenue">
            Total en catálogo:{' '}
            <strong className="texto-mono" style={{ color: 'var(--color-texto-principal)' }}>
              {totalRegistros}
            </strong>{' '}
            registros
          </span>
        </div>

        <p className="texto-tenue" style={{ fontSize: '0.8rem', marginBottom: '12px' }}>
          Regla de borrado lógico: Si un registro está vinculado a novedades históricas, se desactiva preservando la integridad referencial.
        </p>

        <div className="contenedor-tabla">
          <table className="tabla-datos tabla-responsiva-apilada">
            <thead>
              <tr>
                <th>Nombre del Registro</th>
                <th>Casos Vinculados</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {itemsPaginados.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '2rem' }}>
                    No se encontraron registros coincidentes.
                  </td>
                </tr>
              ) : (
                itemsPaginados.map((item) => {
                  const casosCount = contarCasosVinculados(item.nombre);
                  return (
                    <tr key={item.id}>
                      <td data-label="Nombre">
                        <strong>{item.nombre}</strong>
                        {item.descripcion && (
                          <span
                            className="texto-tenue"
                            style={{ display: 'block', fontSize: '0.76rem', marginTop: '2px' }}
                          >
                            {item.descripcion}
                          </span>
                        )}
                      </td>
                      <td data-label="Casos" className="texto-mono">
                        {casosCount} caso(s)
                      </td>
                      <td data-label="Estado">
                        <span className={`badge ${item.estado ? 'badge--activo' : 'badge--inactivo'}`}>
                          {item.estado ? 'Habilitado' : 'Inactivo'}
                        </span>
                      </td>
                      <td data-label="Acciones" style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button
                            type="button"
                            className="boton boton--sm boton--secundario"
                            onClick={() => abrirEditar(item)}
                            title="Editar registro"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            className="boton boton--sm boton--secundario"
                            onClick={() => {
                              toggleEstadoItem(tabActivo, item.id);
                              mostrarToast('Estado del registro actualizado', 'info');
                            }}
                            title={item.estado ? 'Deshabilitar' : 'Habilitar'}
                          >
                            {item.estado ? (
                              <ToggleRight size={16} style={{ color: 'var(--color-exito)' }} />
                            ) : (
                              <ToggleLeft size={16} />
                            )}
                          </button>
                          <button
                            type="button"
                            className="boton boton--sm boton--peligro"
                            onClick={() => manejarEliminar(item)}
                            title="Eliminar registro"
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
        <div className="modal-fondo">
          <div className="modal-contenedor">
            <div className="modal-cabecera">
              <h2 className="modal-titulo">
                {itemEditar ? `Editar ${actual.singular}` : `Nuevo ${actual.singular}`}
              </h2>
              <button
                type="button"
                className="modal-btn-cerrar"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <form className="formulario" onSubmit={guardar} noValidate>
                <CampoEntrada
                  label={`Nombre del Registro (${actual.singular})`}
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
                  <span className="campo-ayuda">
                    Nomenclatura requerida: NUMERO.SUBLOTE (ejemplos válidos: 12.3, 520.0, 189.CASA1, 185.SUITE2).
                  </span>
                )}

                {tabActivo === 'calles' && (
                  <span className="campo-ayuda">
                    Solo letras, números, puntos y espacios.
                  </span>
                )}

                <div className="modal-pie" style={{ padding: 0, background: 'transparent' }}>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => setModalAbierto(false)}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="boton boton--primario">
                    <Check size={16} />
                    <span>Guardar</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INSERCIÓN MASIVA DE LOTES */}
      {modalMasivoAbierto && (
        <div className="modal-fondo">
          <div className="modal-contenedor" style={{ maxWidth: '640px' }}>
            <div className="modal-cabecera">
              <h2 className="modal-titulo">Agregar Varios Lotes (Uno por línea)</h2>
              <button
                type="button"
                className="modal-btn-cerrar"
                onClick={() => setModalMasivoAbierto(false)}
                aria-label="Cerrar modal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <p className="texto-tenue">
                Pegue o escriba un lote por línea con formato <strong>NUMERO.SUBLOTE</strong> (ej: 12.3, 520.0, 189.CASA1, 185.SUITE2).
                El sistema omitirá duplicados y ordenará los lotes naturalmente.
              </p>

              <form className="formulario" onSubmit={procesarCargaMasiva}>
                <div className="campo-grupo">
                  <label className="campo-label" htmlFor="textoMasivoInput">
                    <span>Lista de Lotes (Uno por línea)</span>
                    <span className="campo-requerido">*</span>
                  </label>
                  <textarea
                    id="textoMasivoInput"
                    rows={8}
                    className="campo-textarea texto-mono"
                    placeholder={`189.CASA1\n189.CASA2\n520.0\n12.3\n185.SUITE2`}
                    value={textoMasivo}
                    onChange={(e) => setTextoMasivo(e.target.value)}
                    required
                  />
                </div>

                {resultadoMasivo && (
                  <div
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: resultadoMasivo.exito ? '#f0fdf4' : '#fff1f2',
                      border: `1px solid ${resultadoMasivo.exito ? '#bbf7d0' : '#fecdd3'}`,
                      fontSize: '0.85rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontWeight: 700,
                        color: resultadoMasivo.exito ? 'var(--color-exito)' : 'var(--color-peligro)',
                      }}
                    >
                      {resultadoMasivo.exito ? (
                        <CheckCircle size={16} />
                      ) : (
                        <AlertTriangle size={16} />
                      )}
                      <span>
                        {resultadoMasivo.agregados > 0
                          ? `Se agregaron ${resultadoMasivo.agregados} lotes válidos.`
                          : 'No se agregaron registros.'}
                      </span>
                    </div>

                    {resultadoMasivo.duplicados?.length > 0 && (
                      <span style={{ color: '#b45309' }}>
                        ⚠ {resultadoMasivo.duplicados.length} duplicado(s) omitido(s):{' '}
                        {resultadoMasivo.duplicados.slice(0, 5).join(', ')}
                        {resultadoMasivo.duplicados.length > 5 ? '...' : ''}
                      </span>
                    )}

                    {resultadoMasivo.invalidos?.length > 0 && (
                      <span style={{ color: '#dc2626' }}>
                        ✕ {resultadoMasivo.invalidos.length} línea(s) con formato inválido:{' '}
                        {resultadoMasivo.invalidos.slice(0, 5).join(', ')}
                        {resultadoMasivo.invalidos.length > 5 ? '...' : ''}
                      </span>
                    )}
                  </div>
                )}

                <div className="modal-pie" style={{ padding: 0, background: 'transparent' }}>
                  <button
                    type="button"
                    className="boton boton--secundario"
                    onClick={() => setModalMasivoAbierto(false)}
                  >
                    Cerrar
                  </button>
                  <button type="submit" className="boton boton--primario">
                    <Check size={16} />
                    <span>Validar y Agregar Lotes</span>
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
