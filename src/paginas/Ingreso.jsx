import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, CreditCard, Lock, AlertCircle } from 'lucide-react';
import LogoCasoOK from '../componentes/LogoCasoOK';
import BannerUrbanizacion from '../componentes/BannerUrbanizacion';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { etiquetasRol } from '../datos/datosDemo';
import { soloNumeros } from '../utilidades/validaciones';

/**
 * Ingreso
 * Pantalla de inicio de sesión futurista con degradado verde esmeralda profundo,
 * orbes luminosos ambientales animados, tarjeta glassmorphism, logo CASOOK,
 * y las dos líneas reglamentarias de marca:
 * "Cada caso bajo control." y "SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO".
 */
export default function Ingreso() {
  const { iniciarSesionConCredenciales, iniciarSesionRapida, usuarios } = useSesion();
  const { mostrarToast } = useToast();
  const navegar = useNavigate();

  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [sacudir, setSacudir] = useState(false);

  function dispararError(mensaje, nuevosErrores = {}) {
    setErrores(nuevosErrores);
    setSacudir(true);
    setTimeout(() => setSacudir(false), 450);
    mostrarToast(mensaje, 'alerta');
  }

  function manejarLogin(e) {
    e.preventDefault();
    const nuevosErrores = {};

    if (!cedula.trim()) {
      nuevosErrores.cedula = 'Ingrese su número de cédula';
    } else if (cedula.trim().length !== 10) {
      nuevosErrores.cedula = 'La cédula debe contener exactamente 10 dígitos';
    }

    if (!password.trim()) {
      nuevosErrores.password = 'Ingrese su contraseña';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      dispararError('Por favor complete los campos requeridos', nuevosErrores);
      return;
    }

    setErrores({});
    setCargando(true);

    setTimeout(() => {
      const resultado = iniciarSesionConCredenciales(cedula, password);
      setCargando(false);
      if (!resultado.exito) {
        dispararError(resultado.mensaje, { general: resultado.mensaje });
      } else {
        mostrarToast(`Bienvenido a CASOOK, ${resultado.usuario.nombre}`, 'exito');
        navegar('/');
      }
    }, 350);
  }

  function accesoRapido(u) {
    const res = iniciarSesionRapida(u);
    if (res.exito) {
      mostrarToast(`Acceso directo como ${u.nombre} (${etiquetasRol[u.rol]})`, 'exito');
      navegar('/');
    } else {
      mostrarToast(res.mensaje, 'alerta');
    }
  }

  return (
    <div className="pantalla-login">
      {/* Orbes ambientales decorativos luminosos flotantes */}
      <div className="pantalla-login__orbe pantalla-login__orbe--1" aria-hidden="true" />
      <div className="pantalla-login__orbe pantalla-login__orbe--2" aria-hidden="true" />
      <div className="pantalla-login__orbe pantalla-login__orbe--3" aria-hidden="true" />

      <div
        className={`pantalla-login__tarjeta ${sacudir ? 'animar-shake' : ''}`}
        role="main"
      >
        {/* Banner institucional de la urbanización con degradado dorado */}
        <BannerUrbanizacion enLogin />

        <div className="pantalla-login__marca">
          <LogoCasoOK size="lg" variante="oscura" />
          <h1 className="pantalla-login__lema">Cada caso bajo control.</h1>
          <p className="pantalla-login__subtitulo">
            SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO
          </p>
        </div>

        {errores.general && (
          <div className="pantalla-login__error" role="alert">
            <AlertCircle size={18} />
            <span>{errores.general}</span>
          </div>
        )}

        <form className="formulario" onSubmit={manejarLogin} noValidate>
          <CampoEntrada
            label="Cédula de Identidad"
            name="cedula"
            icono={CreditCard}
            valor={cedula}
            onChange={(e) => {
              setCedula(soloNumeros(e.target.value));
              if (errores.cedula || errores.general) setErrores({});
            }}
            error={errores.cedula}
            requerido
            placeholder="Ej: 1710034065"
            maxlength={10}
            autoComplete="username"
          />

          <CampoEntrada
            label="Contraseña"
            name="password"
            tipo="password"
            icono={Lock}
            valor={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errores.password || errores.general) setErrores({});
            }}
            error={errores.password}
            requerido
            placeholder="••••••••"
            ayuda="(Contraseña inicial = Número de cédula)"
            autoComplete="current-password"
          />

          <button
            type="submit"
            className={`boton boton--primario boton--completo pantalla-login__btn-acceso ${
              cargando ? 'boton--cargando' : ''
            }`}
            disabled={cargando}
          >
            {cargando ? (
              <>
                <span className="spinner" aria-hidden="true" />
                <span>Verificando credenciales...</span>
              </>
            ) : (
              <>
                <LogIn size={18} />
                <span>Ingresar al Sistema</span>
              </>
            )}
          </button>
        </form>

        {/* Acceso rápido para pruebas de roles */}
        <div className="pantalla-login__usuarios-demo">
          <span className="pantalla-login__demo-titulo">
            Acceso Rápido para Pruebas (Roles)
          </span>
          <div className="pantalla-login__demo-botones">
            {usuarios.map((u) => (
              <button
                key={u.id}
                type="button"
                className="pantalla-login__demo-btn"
                onClick={() => accesoRapido(u)}
                title={`Ingresar como ${u.nombre} ${u.apellido}`}
              >
                <div>{u.nombre}</div>
                <div style={{ color: 'var(--color-dorado-hover)', fontSize: '0.68rem' }}>
                  {etiquetasRol[u.rol]}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
