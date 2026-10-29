import { useState } from 'react';
import { KeyRound, Check, ShieldCheck, User } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { etiquetasRol } from '../datos/datosDemo';

/**
 * Perfil
 * Vista del perfil de usuario y cambio seguro de contraseña.
 */
export default function Perfil() {
  const { usuario, cambiarPassword } = useSesion();
  const { mostrarToast } = useToast();

  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirmar, setClaveConfirmar] = useState('');

  function manejarCambioClave(e) {
    e.preventDefault();

    if (!claveActual || !claveNueva || !claveConfirmar) {
      mostrarToast('Todos los campos de contraseña son requeridos', 'alerta');
      return;
    }

    if (claveNueva !== claveConfirmar) {
      mostrarToast('La nueva contraseña y su confirmación no coinciden', 'alerta');
      return;
    }

    if (claveNueva.length < 4) {
      mostrarToast('La contraseña debe tener al menos 4 caracteres', 'alerta');
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espacio-5)' }}>
      <EncabezadoPagina
        titulo="Mi Perfil de Usuario"
        subtitulo="Datos de cuenta institucional y seguridad de credenciales"
      />

      <section className="cuadricula-datos-2col">
        <div className="dato-item">
          <span className="dato-item__etiqueta">Nombres y Apellidos</span>
          <div className="dato-item__valor">
            {usuario?.nombre} {usuario?.apellido}
          </div>
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Cédula de Identidad</span>
          <div
            className="dato-item__valor texto-mono"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <ShieldCheck size={16} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>{usuario?.cedula}</span>
          </div>
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Rol en el Sistema</span>
          <div className="dato-item__valor">
            <span className="badge badge--superusuario">
              {etiquetasRol[usuario?.rol] || usuario?.rol}
            </span>
          </div>
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Estado de Cuenta</span>
          <div className="dato-item__valor">
            <span className="badge badge--activo">Activo y Habilitado</span>
          </div>
        </div>
      </section>

      {/* MÓDULO CAMBIO DE CONTRASEÑA */}
      <section className="formulario__seccion" style={{ maxWidth: '560px' }}>
        <h2 className="formulario__seccion-titulo">
          <KeyRound size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
          <span>Cambio de Contraseña</span>
        </h2>
        <p className="texto-tenue">
          Por seguridad institucional se recomienda cambiar la contraseña inicial asignada.
        </p>

        <form onSubmit={manejarCambioClave} className="formulario">
          <CampoEntrada
            label="Contraseña Actual"
            tipo="password"
            requerido
            placeholder="••••••••"
            valor={claveActual}
            onChange={(e) => setClaveActual(e.target.value)}
          />

          <CampoEntrada
            label="Nueva Contraseña"
            tipo="password"
            requerido
            placeholder="••••••••"
            valor={claveNueva}
            onChange={(e) => setClaveNueva(e.target.value)}
            ayuda="Mínimo 4 caracteres"
          />

          <CampoEntrada
            label="Confirmar Nueva Contraseña"
            tipo="password"
            requerido
            placeholder="••••••••"
            valor={claveConfirmar}
            onChange={(e) => setClaveConfirmar(e.target.value)}
          />

          <button
            type="submit"
            className="boton boton--primario"
            style={{ alignSelf: 'flex-start' }}
          >
            <Check size={16} />
            <span>Actualizar Contraseña</span>
          </button>
        </form>
      </section>
    </div>
  );
}
