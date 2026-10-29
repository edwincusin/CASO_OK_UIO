import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Save } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Insignia from '../componentes/Insignia';
import BannerUrbanizacion from '../componentes/BannerUrbanizacion';
import CampoEntrada from '../componentes/CampoEntrada';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { useToast } from '../contextos/ContextoToast';
import { puedeVerConfiguracion } from '../utilidades/permisos';

/**
 * Configuracion
 * Configuración institucional del sistema (Superusuario):
 * - Nombre de la urbanización con validación (3 a 60 caracteres) y vista previa en vivo.
 * - Plazos en días para cada nivel de prioridad.
 */
export default function Configuracion() {
  const { usuario } = useSesion();
  const { prioridades, cambiarPlazoPrioridad } = useCasos();
  const { nombreUrbanizacion, guardarNombreUrbanizacion } = useConfiguracion();
  const { mostrarToast } = useToast();

  const [nombreForm, setNombreForm] = useState(nombreUrbanizacion);
  const [errorNombre, setErrorNombre] = useState('');

  if (!puedeVerConfiguracion(usuario)) return <Navigate to="/" replace />;

  function guardarUrbanizacion(e) {
    e.preventDefault();
    const limpio = (nombreForm || '').trim();

    if (limpio.length < 3 || limpio.length > 60) {
      setErrorNombre('El nombre debe tener entre 3 y 60 caracteres');
      mostrarToast('El nombre debe tener entre 3 y 60 caracteres', 'alerta');
      return;
    }

    try {
      guardarNombreUrbanizacion(limpio);
      setErrorNombre('');
      mostrarToast('Nombre de la urbanización actualizado con éxito', 'exito');
    } catch (err) {
      setErrorNombre(err.message || 'Error al guardar');
      mostrarToast(err.message || 'Error al guardar', 'alerta');
    }
  }

  function manejarCambioPlazo(id, valor) {
    cambiarPlazoPrioridad(id, valor);
    mostrarToast(`Plazo actualizado a ${valor} día(s)`, 'info');
  }

  return (
    <div className="pagina-configuracion">
      <EncabezadoPagina
        titulo="Configuración del Sistema"
        subtitulo="Identidad institucional de la urbanización y parámetros operativos de seguimiento"
      />

      {/* SECCIÓN 1: NOMBRE DE LA URBANIZACIÓN */}
      <section className="formulario__seccion">
        <h2 className="formulario__seccion-titulo">
          <Building2 size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
          <span>Identidad de la Urbanización</span>
        </h2>
        <p className="texto-tenue">
          Este nombre se refleja dinámicamente en la cabecera con desenfoque, reportes PDF y formatos de exportación.
        </p>

        <form onSubmit={guardarUrbanizacion} className="formulario" style={{ maxWidth: '650px' }}>
          <CampoEntrada
            label="Nombre de la Urbanización (3 a 60 caracteres)"
            requerido
            valor={nombreForm}
            onChange={(e) => {
              setNombreForm(e.target.value);
              if (errorNombre) setErrorNombre('');
            }}
            error={errorNombre}
            placeholder="Ej: Urbanización El Condado, Los Quindes"
            maxlength={60}
          />

          {/* VISTA PREVIA EN VIVO */}
          <div
            style={{
              background: '#f8fafc',
              border: '1.5px dashed var(--color-borde)',
              borderRadius: 'var(--radio-md)',
              padding: '16px',
            }}
          >
            <span
              className="texto-kicker"
              style={{ display: 'block', marginBottom: '8px' }}
            >
              Vista Previa en Vivo:
            </span>
            <div
              style={{
                background: '#092f20',
                borderRadius: '8px',
                padding: '8px',
              }}
            >
              <BannerUrbanizacion />
            </div>
          </div>

          <button
            type="submit"
            className="boton boton--primario"
            style={{ alignSelf: 'flex-start' }}
          >
            <Save size={16} />
            <span>Guardar Nombre de Urbanización</span>
          </button>
        </form>
      </section>

      {/* SECCIÓN 2: PRIORIDADES Y PLAZOS */}
      <section className="formulario__seccion">
        <h2 className="formulario__seccion-titulo">
          <span>Prioridades y Plazos de Atención</span>
        </h2>
        <p className="texto-tenue">
          Establece los días de plazo para el seguimiento obligatorio de cada novedad según su urgencia.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
          {prioridades.map((prioridad) => (
            <div
              key={prioridad.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                border: '1px solid var(--color-borde)',
                borderRadius: 'var(--radio-md)',
                background: 'var(--color-superficie)',
                flexWrap: 'wrap',
                gap: '8px',
              }}
            >
              <Insignia
                texto={prioridad.nombre}
                variante={prioridad.id}
                color={prioridad.color}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  min="0"
                  max="90"
                  className="campo-input texto-mono"
                  style={{ width: '80px', textAlign: 'center' }}
                  value={prioridad.plazoDias}
                  onChange={(e) => manejarCambioPlazo(prioridad.id, Number(e.target.value))}
                />
                <span className="texto-tenue">días de plazo para atención</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
