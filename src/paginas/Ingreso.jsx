import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn } from 'lucide-react';
import LogoQuinde from '../componentes/LogoQuinde';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { etiquetasRol } from '../datos/datosDemo';
import { soloNumeros } from '../utilidades/validaciones';
import CampoEntrada from '../componentes/CampoEntrada';

export default function Ingreso() {
  const { iniciarSesionConCredenciales, iniciarSesionRapida, usuarios } = useSesion();
  const { mostrarToast } = useToast();
  const navegar = useNavigate();

  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [errores, setErrores] = useState({});

  function manejarLogin(e) {
    e.preventDefault();
    const nuevosErrores = {};

    if (!cedula.trim()) {
      nuevosErrores.cedula = 'INGRESE SU NÚMERO DE CÉDULA';
    } else if (cedula.trim().length !== 10) {
      nuevosErrores.cedula = 'LA CÉDULA DEBE CONTENER EXACTAMENTE 10 DÍGITOS';
    }

    if (!password.trim()) {
      nuevosErrores.password = 'INGRESE SU CONTRASEÑA';
    }

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      mostrarToast('POR FAVOR COMPLETE LOS CAMPOS REQUERIDOS', 'alerta');
      return;
    }

    setErrores({});
    const resultado = iniciarSesionConCredenciales(cedula, password);
    if (!resultado.exito) {
      mostrarToast(resultado.mensaje, 'alerta');
    } else {
      mostrarToast(`BIENVENIDO A QUINDE CONTROL, ${resultado.usuario.nombre}`, 'exito');
      navegar('/');
    }
  }

  function accesoRapido(u) {
    const res = iniciarSesionRapida(u);
    if (res.exito) {
      mostrarToast(`ACCESO COMO ${u.nombre} (${etiquetasRol[u.rol]})`, 'exito');
      navegar('/');
    } else {
      mostrarToast(res.mensaje, 'alerta');
    }
  }

  return (
    <div className="ingreso" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center' }}>
      <div className="tarjeta ingreso__tarjeta" style={{ margin: 'auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.4rem' }}>
            <LogoQuinde size={64} />
          </div>
          <div style={{ fontWeight: 900, fontSize: '1.5rem', color: 'var(--color-primario)', letterSpacing: '0.04em' }}>
            QUINDE CONTROL
          </div>
          <p className="marca__eslogan" style={{ fontSize: '0.88rem', marginTop: '0.15rem' }}>
            Cada caso bajo control.
          </p>
          <div className="texto-tenue" style={{ fontSize: '0.75rem', marginTop: '0.4rem', letterSpacing: '0.04em' }}>
            SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO · URBANIZACIÓN EL QUINDE 
          </div>
        </div>

        <form className="formulario" onSubmit={manejarLogin} noValidate>
          <CampoEntrada
            label="CÉDULA DE IDENTIDAD"
            name="cedula"
            valor={cedula}
            onChange={(e) => {
              setCedula(soloNumeros(e.target.value));
              if (errores.cedula) setErrores({ ...errores, cedula: '' });
            }}
            error={errores.cedula}
            requerido
            placeholder="EJ: 1710034065"
            maxlength={10}
          />

          <CampoEntrada
            label="CONTRASEÑA"
            name="password"
            tipo="password"
            valor={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errores.password) setErrores({ ...errores, password: '' });
            }}
            error={errores.password}
            requerido
            placeholder="••••••••"
          />
          <span className="texto-tenue" style={{ fontSize: '0.75rem', marginTop: '-0.3rem' }}>
            (Contraseña inicial por defecto = Cédula de identidad)
          </span>

          <button type="submit" className="boton boton--primario boton--completo" style={{ marginTop: '0.5rem' }}>
            <LogIn size={16} /> INGRESAR AL SISTEMA
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--color-borde)', paddingTop: '1rem', marginTop: '0.5rem' }}>
          <div className="texto-tenue" style={{ fontWeight: 700, marginBottom: '0.5rem', textAlign: 'center', fontSize: '0.78rem' }}>
            ACCESO RÁPIDO PARA PRUEBAS (ROLES V4.0):
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.45rem' }}>
            {usuarios.map((u) => (
              <button
                key={u.id}
                type="button"
                className="boton boton--contorno"
                style={{
                  fontSize: '0.75rem',
                  padding: '0.5rem',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  lineHeight: 1.25,
                }}
                onClick={() => accesoRapido(u)}
              >
                <strong>{u.nombre} {u.apellido}</strong>
                <span className="texto-tenue" style={{ fontSize: '0.7rem' }}>{etiquetasRol[u.rol]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
