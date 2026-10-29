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
      nuevosErrores.nombre = 'INGRESE LOS NOMBRES DEL USUARIO (SOLO LETRAS)';
    }
    if (!form.apellido.trim()) {
      nuevosErrores.apellido = 'INGRESE LOS APELLIDOS DEL USUARIO (SOLO LETRAS)';
    }

    if (!usuarioEditar) {
      if (!form.cedula.trim()) {
        nuevosErrores.cedula = 'LA CÉDULA ES OBLIGATORIA';
      } else if (!validarCedulaEcuatoriana(form.cedula)) {
        nuevosErrores.cedula = 'CÉDULA INVÁLIDA (ALGORITMO MÓDULO 10 DEL REGISTRO CIVIL)';
      } else if (usuarios.some((u) => u.cedula === form.cedula.trim())) {
        nuevosErrores.cedula = 'YA EXISTE UN USUARIO REGISTRADO CON ESTA CÉDULA';
      }
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      mostrarToast('POR FAVOR REVISE LOS CAMPOS CON ERROR', 'alerta');
      return;
    }

    setErrores({});
    if (usuarioEditar) {
      actualizarUsuario(usuarioEditar.id, {
        nombre: aMayusculas(form.nombre),
        apellido: aMayusculas(form.apellido),
        rol: form.rol,
      });
      mostrarToast('USUARIO ACTUALIZADO CORRECTAMENTE', 'exito');
    } else {
      crearUsuario(form);
      mostrarToast('USUARIO CREADO (CONTRASEÑA = NÚMERO DE CÉDULA)', 'exito');
    }
    setModalAbierto(false);
  }

  function manejarReset(u) {
    resetearPassword(u.id);
    mostrarToast(`CONTRASEÑA RESTABLECIDA A ${u.cedula}`, 'exito');
  }

  return (
    <>
      <EncabezadoPagina
        titulo="GESTIÓN DE USUARIOS (SUPERUSUARIO)"
        subtitulo="CASOOK · Validación Módulo 10, paginación a 20 e inputs estrictos"
      >
        <button className="boton boton--primario" onClick={abrirNuevo}>
          <Plus size={18} /> NUEVO USUARIO
        </button>
      </EncabezadoPagina>

      <section className="tarjeta">
        <p className="texto-tenue" style={{ marginBottom: '1rem' }}>
          CONTROL DE ACCESOS Y CUENTAS. AUDITORÍA ALGORÍTMICA OFICIAL MÓDULO 10.
        </p>

        <div className="tabla-contenedor">
          <table className="tabla-datos">
            <thead>
              <tr>
                <th>CÉDULA (MÓDULO 10)</th>
                <th>NOMBRES Y APELLIDOS</th>
                <th>ROL ASIGNADO</th>
                <th>ESTADO</th>
                <th style={{ textAlign: 'right' }}>ACCIONES</th>
              </tr>
            </thead>
            <tbody>
              {usuariosPaginados.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <ShieldCheck size={14} style={{ color: 'var(--color-secundario)' }} />
                      {u.cedula}
                    </strong>
                  </td>
                  <td>{u.nombre} {u.apellido}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--color-primario)' }}>
                      {etiquetasRol[u.rol] || u.rol}
                    </span>
                  </td>
                  <td>
                    {u.estado ? (
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
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => abrirEditar(u)}
                        title="Editar datos del usuario"
                      >
                        <Edit2 size={13} />
                      </button>

                      <button
                        type="button"
                        className="boton boton--contorno"
                        style={{ padding: '0.3rem 0.5rem', fontSize: '0.8rem' }}
                        onClick={() => manejarReset(u)}
                        title="Restablecer clave a número de cédula"
                      >
                        <KeyRound size={13} />
                      </button>

                      {u.id !== usuario.id && (
                        <button
                          type="button"
                          className="boton boton--contorno"
                          style={{
                            padding: '0.3rem 0.5rem',
                            fontSize: '0.8rem',
                            color: u.estado ? 'var(--color-alerta)' : 'var(--color-secundario)',
                          }}
                          onClick={() => {
                            toggleEstadoUsuario(u.id);
                            mostrarToast(
                              `ESTADO CAMBIADO A ${u.estado ? 'INACTIVO' : 'HABILITADO'}`,
                              'info'
                            );
                          }}
                          title={u.estado ? 'Desactivar usuario' : 'Activar usuario'}
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

        {/* PAGINADOR */}
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
              <h2>{usuarioEditar ? 'EDITAR USUARIO' : 'CREAR NUEVO USUARIO'}</h2>
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
                label="CÉDULA DE IDENTIDAD (10 DÍGITOS ECUADOR)"
                requerido
                disabled={Boolean(usuarioEditar)}
                valor={form.cedula}
                onChange={(e) => {
                  const soloNum = soloNumeros(e.target.value);
                  setForm({ ...form, cedula: soloNum });
                  if (errores.cedula) setErrores({ ...errores, cedula: '' });
                }}
                error={errores.cedula}
                placeholder="EJ: 1710034065"
                maxlength={10}
              />

              {!usuarioEditar && form.cedula.length > 0 && (
                <div style={{ marginTop: '-0.3rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  {cedulaEsValida ? (
                    <span style={{ color: 'var(--color-secundario)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <ShieldCheck size={14} /> CÉDULA VÁLIDA (MÓDULO 10 VERIFICADO)
                    </span>
                  ) : (
                    <span style={{ color: 'var(--color-error)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                      <AlertCircle size={14} /> CÉDULA INVÁLIDA O INCOMPLETA (MÓDULO 10)
                    </span>
                  )}
                </div>
              )}

              <div className="grid-2">
                <CampoEntrada
                  label="NOMBRES"
                  requerido
                  valor={form.nombre}
                  onChange={(e) => {
                    setForm({ ...form, nombre: soloLetras(aMayusculas(e.target.value)) });
                    if (errores.nombre) setErrores({ ...errores, nombre: '' });
                  }}
                  error={errores.nombre}
                  placeholder="CARLOS ALBERTO (SOLO LETRAS)"
                />

                <CampoEntrada
                  label="APELLIDOS"
                  requerido
                  valor={form.apellido}
                  onChange={(e) => {
                    setForm({ ...form, apellido: soloLetras(aMayusculas(e.target.value)) });
                    if (errores.apellido) setErrores({ ...errores, apellido: '' });
                  }}
                  error={errores.apellido}
                  placeholder="MENDOZA RIVAS (SOLO LETRAS)"
                />
              </div>

              <div className="campo-grupo">
                <label className="campo-label">ROL DEL SISTEMA *</label>
                <select
                  className="campo-input"
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                >
                  <option value="superusuario">SUPERUSUARIO</option>
                  <option value="operador_administracion">OPERADOR ADMINISTRACIÓN</option>
                  <option value="operador_seguridad">OPERADOR SEGURIDAD</option>
                  <option value="mantenimiento">MANTENIMIENTO</option>
                </select>
              </div>

              <div className="acciones" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  className="boton boton--contorno"
                  onClick={() => setModalAbierto(false)}
                >
                  CANCELAR
                </button>
                <button type="submit" className="boton boton--primario">
                  <Check size={16} /> {usuarioEditar ? 'GUARDAR CAMBIOS' : 'CREAR USUARIO'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
