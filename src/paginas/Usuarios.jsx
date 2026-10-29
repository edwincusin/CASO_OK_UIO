import { useState, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Edit2, KeyRound, Check, X, UserX, UserCheck, ShieldCheck, AlertCircle } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import CampoEntrada from '../componentes/CampoEntrada';
import Paginador from '../componentes/Paginador';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { etiquetasRol } from '../datos/datosDemo';
import { esSuperusuario } from '../utilidades/permisos';
import { aMayusculas } from '../utilidades/texto';
import { soloLetras, soloNumeros, validarCedulaEcuatoriana } from '../utilidades/validaciones';

/**
 * Usuarios
 * Gestión y auditoría de cuentas de usuario con validación Módulo 10,
 * alternancia de estado y restablecimiento de contraseña.
 */
export default function Usuarios() {
  const {
    usuario,
    usuarios,
    crearUsuario,
    actualizarUsuario,
    toggleEstadoUsuario,
    resetearPassword,
  } = useSesion();
  const { mostrarToast } = useToast();

  if (!esSuperusuario(usuario)) {
    return <Navigate to="/" replace />;
  }

  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditar, setUsuarioEditar] = useState(null);

  const [form, setForm] = useState({
    cedula: '',
    nombre: '',
    apellido: '',
    rol: 'operador_administracion',
  });
  const [errores, setErrores] = useState({});

  // Paginador
  const [paginaActual, setPaginaActual] = useState(1);
  const porPagina = 20;
  const totalRegistros = usuarios.length;
  const totalPaginas = Math.ceil(totalRegistros / porPagina) || 1;

  const usuariosPaginados = useMemo(() => {
    const inicio = (paginaActual - 1) * porPagina;
    return usuarios.slice(inicio, inicio + porPagina);
  }, [usuarios, paginaActual, porPagina]);

  const cedulaEsValida = form.cedula.length === 10 ? validarCedulaEcuatoriana(form.cedula) : false;

  function abrirNuevo() {
    setUsuarioEditar(null);
    setForm({
      cedula: '',
      nombre: '',
      apellido: '',
      rol: 'operador_administracion',
    });
    setErrores({});
    setModalAbierto(true);
  }

  function abrirEditar(u) {
    setUsuarioEditar(u);
    setForm({
      cedula: u.cedula,
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
    });
    setErrores({});
    setModalAbierto(true);
  }

  function guardar(e) {
    e.preventDefault();
    const nuevosErrores = {};

    if (!form.nombre.trim()) {
      nuevosErrores.nombre = 'Ingrese los nombres del usuario (solo letras y espacios)';
    }
    if (!form.apellido.trim()) {
      nuevosErrores.apellido = 'Ingrese los apellidos del usuario (solo letras y espacios)';
    }

    if (!usuarioEditar) {
      if (!form.cedula.trim()) {
        nuevosErrores.cedula = 'La cédula es obligatoria';
      } else if (!validarCedulaEcuatoriana(form.cedula)) {
        nuevosErrores.cedula = 'Cédula inválida (Algoritmo Módulo 10 del Registro Civil)';
      } else if (usuarios.some((u) => u.cedula === form.cedula.trim())) {
        nuevosErrores.cedula = 'Ya existe un usuario registrado con esta cédula';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      mostrarToast('Por favor revise los campos con error', 'alerta');
      return;
    }

    setErrores({});
    if (usuarioEditar) {
      actualizarUsuario(usuarioEditar.id, {
        nombre: aMayusculas(form.nombre),
        apellido: aMayusculas(form.apellido),
        rol: form.rol,
      });
      mostrarToast('Usuario actualizado correctamente', 'exito');
    } else {
      crearUsuario(form);
      mostrarToast('Usuario creado (contraseña inicial = cédula)', 'exito');
    }
    setModalAbierto(false);
  }

  function manejarReset(u) {
    resetearPassword(u.id);
    mostrarToast(`Contraseña restablecida al número de cédula ${u.cedula}`, 'exito');
  }

  return (
    <div className="pagina-usuarios">
      <EncabezadoPagina
        titulo="Gestión de Usuarios"
        subtitulo="Auditoría algorítmica Módulo 10, asignación de roles y control de acceso"
      >
        <button type="button" className="boton boton--primario" onClick={abrirNuevo}>
          <Plus size={18} />
          <span>Nuevo Usuario</span>
        </button>
      </EncabezadoPagina>

      <section className="tarjeta">
        <p className="texto-tenue">
          Control institucional de cuentas y credenciales. Validación algorítmica de identidad ecuatoriana.
        </p>

        <div className="contenedor-tabla" style={{ marginTop: '12px' }}>
          <table className="tabla-datos tabla-responsiva-apilada">
            <thead>
              <tr>
                <th>Cédula (Módulo 10)</th>
                <th>Nombres y Apellidos</th>
                <th>Rol Asignado</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u) => (
                <tr key={u.id}>
                  <td data-label="Cédula" className="columna-codigo">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--color-esmeralda-medio)' }} />
                      {u.cedula}
                    </span>
                  </td>
                  <td data-label="Nombres">
                    <strong>{u.nombre} {u.apellido}</strong>
                  </td>
                  <td data-label="Rol">
                    <span className="badge badge--superusuario" style={{ textTransform: 'none' }}>
                      {etiquetasRol[u.rol] || u.rol}
                    </span>
                  </td>
                  <td data-label="Estado">
                    <span className={`badge ${u.estado ? 'badge--activo' : 'badge--inactivo'}`}>
                      {u.estado ? 'Habilitado' : 'Inactivo'}
                    </span>
                  </td>
                  <td data-label="Acciones" style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        type="button"
                        className="boton boton--sm boton--secundario"
                        onClick={() => abrirEditar(u)}
                        title="Editar datos del usuario"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="boton boton--sm boton--secundario"
                        onClick={() => manejarReset(u)}
                        title="Restablecer clave al número de cédula"
                      >
                        <KeyRound size={13} />
                      </button>

                      {u.id !== usuario.id && (
                        <button
                          type="button"
                          className={`boton boton--sm ${
                            u.estado ? 'boton--peligro' : 'boton--primario'
                          }`}
                          onClick={() => {
                            toggleEstadoUsuario(u.id);
                            mostrarToast(
                              `Estado cambiado a ${u.estado ? 'Inactivo' : 'Habilitado'}`,
                              'info'
                            );
                          }}
                          title={u.estado ? 'Desactivar usuario' : 'Habilitar usuario'}
                        >
                          {u.estado ? <UserX size={13} /> : <UserCheck size={13} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
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

      {/* MODAL CREAR / EDITAR */}
      {modalAbierto && (
        <div className="modal-fondo">
          <div className="modal-contenedor">
            <div className="modal-cabecera">
              <h2 className="modal-titulo">
                {usuarioEditar ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h2>
              <button
                type="button"
                className="modal-btn-cerrar"
                onClick={() => setModalAbierto(false)}
                aria-label="Cerrar ventana"
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-cuerpo">
              <form className="formulario" onSubmit={guardar} noValidate>
                <CampoEntrada
                  label="Cédula de Identidad (10 dígitos Ecuador)"
                  requerido
                  disabled={Boolean(usuarioEditar)}
                  valor={form.cedula}
                  onChange={(e) => {
                    const soloNum = soloNumeros(e.target.value);
                    setForm({ ...form, cedula: soloNum });
                    if (errores.cedula) setErrores({ ...errores, cedula: '' });
                  }}
                  error={errores.cedula}
                  placeholder="Ej: 1710034065"
                  maxlength={10}
                />

                {!usuarioEditar && form.cedula.length > 0 && (
                  <div style={{ marginTop: '-4px', fontSize: '0.8rem' }}>
                    {cedulaEsValida ? (
                      <span
                        style={{
                          color: 'var(--color-exito)',
                          fontWeight: 700,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <ShieldCheck size={14} /> Cédula válida (Módulo 10 verificado)
                      </span>
                    ) : (
                      <span
                        style={{
                          color: 'var(--color-peligro)',
                          fontWeight: 600,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <AlertCircle size={14} /> Cédula incompleta o no pasa el Módulo 10
                      </span>
                    )}
                  </div>
                )}

                <div className="grid-formulario-2">
                  <CampoEntrada
                    label="Nombres"
                    requerido
                    valor={form.nombre}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        nombre: soloLetras(aMayusculas(e.target.value)),
                      });
                      if (errores.nombre) setErrores({ ...errores, nombre: '' });
                    }}
                    error={errores.nombre}
                    placeholder="Carlos Alberto"
                  />

                  <CampoEntrada
                    label="Apellidos"
                    requerido
                    valor={form.apellido}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        apellido: soloLetras(aMayusculas(e.target.value)),
                      });
                      if (errores.apellido) setErrores({ ...errores, apellido: '' });
                    }}
                    error={errores.apellido}
                    placeholder="Mendoza Rivas"
                  />
                </div>

                <div className="campo-grupo">
                  <label className="campo-label" htmlFor="rolSelect">
                    <span>Rol del Sistema</span>
                    <span className="campo-requerido">*</span>
                  </label>
                  <select
                    id="rolSelect"
                    className="campo-select"
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  >
                    <option value="superusuario">Superusuario</option>
                    <option value="operador_administracion">Operador Administración</option>
                    <option value="operador_seguridad">Operador Seguridad</option>
                    <option value="mantenimiento">Mantenimiento</option>
                  </select>
                </div>

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
                    <span>{usuarioEditar ? 'Guardar Cambios' : 'Crear Usuario'}</span>
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
