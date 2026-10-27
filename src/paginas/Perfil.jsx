import { useState } from 'react';
import { UserCheck, KeyRound, Shield, Check } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { etiquetasRol } from '../datos/datosDemo';

export default function Perfil() {
  const { usuario, cambiarPassword } = useSesion();
  const { mostrarToast } = useToast();

  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirmar, setClaveConfirmar] = useState('');

  function manejarCambioClave(e) {
    e.preventDefault();

    if (!claveActual || !claveNueva || !claveConfirmar) {
      mostrarToast('TODOS LOS CAMPOS DE CONTRASEÑA SON OBLIGATORIOS', 'alerta');
      return;
    }

    if (claveNueva !== claveConfirmar) {
      mostrarToast('LA NUEVA CONTRASEÑA Y SU CONFIRMACIÓN NO COINCIDEN', 'alerta');
      return;
    }

    if (claveNueva.length < 4) {
      mostrarToast('LA CONTRASEÑA DEBE TENER AL MENOS 4 CARACTERES', 'alerta');
      return;
    }

    const res = cambiarPassword(usuario.id, claveActual, claveNueva);
    if (res.exito) {
      mostrarToast(res.mensaje, 'exito');
      setClaveActual('');
      setClaveNueva('');
      setClaveConfirmar('');
    } else {
      mostrarToast(res.mensaje, 'alerta');
    }
  }

  return (
    <>
      <EncabezadoPagina titulo="MI PERFIL DE USUARIO" />

      <section className="tarjeta datos" style={{ marginBottom: '1.5rem' }}>
        <div>
          <div className="datos__titulo">NOMBRES Y APELLIDOS</div>
          <strong>{usuario?.nombre} {usuario?.apellido}</strong>
        </div>
        <div>
          <div className="datos__titulo">CÉDULA DE IDENTIDAD</div>
          <span>{usuario?.cedula}</span>
        </div>
        <div>
          <div className="datos__titulo">ROL EN EL SISTEMA</div>
          <span style={{ color: 'var(--color-primario)', fontWeight: 700 }}>
            {etiquetasRol[usuario?.rol] || usuario?.rol}
          </span>
        </div>
        <div>
          <div className="datos__titulo">ESTADO DE CUENTA</div>
          <span className="insignia-estado-activo">ACTIVO Y HABILITADO</span>
        </div>
      </section>

      {/* MÓDULO CAMBIO DE CONTRASEÑA */}
      <section className="tarjeta formulario">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <KeyRound size={20} />
          <h2>CAMBIO DE CONTRASEÑA</h2>
        </div>
        <p className="texto-tenue">
          REGLA DE SEGURIDAD: TODOS LOS USUARIOS TIENEN POR DEFECTO SU CÉDULA COMO CONTRASEÑA. SE RECOMIENDA CAMBIARLA POR UNA PERSONAL.
        </p>

        <form onSubmit={manejarCambioClave} className="formulario" style={{ maxWidth: '480px' }}>
          <div className="campo">
            <label htmlFor="claveActual">CONTRASEÑA ACTUAL *</label>
            <input
              id="claveActual"
              type="password"
              required
              placeholder="••••••••"
              value={claveActual}
              onChange={(e) => setClaveActual(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="claveNueva">NUEVA CONTRASEÑA *</label>
            <input
              id="claveNueva"
              type="password"
              required
              placeholder="••••••••"
              value={claveNueva}
              onChange={(e) => setClaveNueva(e.target.value)}
            />
          </div>

          <div className="campo">
            <label htmlFor="claveConfirmar">CONFIRMAR NUEVA CONTRASEÑA *</label>
            <input
              id="claveConfirmar"
              type="password"
              required
              placeholder="••••••••"
              value={claveConfirmar}
              onChange={(e) => setClaveConfirmar(e.target.value)}
            />
          </div>

          <button type="submit" className="boton boton--primario">
            <Check size={16} /> ACTUALIZAR MI CONTRASEÑA
          </button>
        </form>
      </section>
    </>
  );
}
