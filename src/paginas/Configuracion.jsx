import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Save, CheckCircle } from 'lucide-react';
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
 * Pantalla de configuración del sistema accesible exclusivamente para Superusuario.
 * Permite cambiar el nombre de la urbanización con validación de 3 a 60 caracteres y vista previa en vivo.
 * Permite además configurar los plazos en días de las prioridades de atención.
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
      setErrorNombre('EL NOMBRE DEBE TENER ENTRE 3 Y 60 CARACTERES');
      mostrarToast('EL NOMBRE DEBE TENER ENTRE 3 Y 60 CARACTERES', 'alerta');
      return;
    }

    try {
      guardarNombreUrbanizacion(limpio);
      setErrorNombre('');
      mostrarToast('NOMBRE DE LA URBANIZACIÓN ACTUALIZADO CON ÉXITO', 'exito');
    } catch (err) {
      setErrorNombre(err.message || 'ERROR AL GUARDAR');
      mostrarToast(err.message || 'ERROR AL GUARDAR', 'alerta');
    }
  }

  function manejarCambioPlazo(id, valor) {
    cambiarPlazoPrioridad(id, valor);
    mostrarToast(`PLAZO ACTUALIZADO A ${valor} DÍA(S)`, 'info');
  }

  return (
    <>
      <EncabezadoPagina
        titulo="CONFIGURACIÓN DEL SISTEMA"
        subtitulo="CASOOK · Identidad institucional y parámetros operativos de seguimiento"
      />

      {/* SECCIÓN 1: NOMBRE DE LA URBANIZACIÓN CON VISTA PREVIA EN VIVO */}
      <section className="tarjeta formulario" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Building2 size={20} style={{ color: 'var(--color-primario)' }} />
          <h2>IDENTIDAD DE LA URBANIZACIÓN</h2>
        </div>
        <p className="texto-tenue">
          ESTE NOMBRE SE REFLEJA DE INMEDIATO EN LA CABECERA PRINCIPAL, REPORTES PDF, MENSAJES DE WHATSAPP Y PIE DE PÁGINA.
        </p>

        <form onSubmit={guardarUrbanizacion} className="formulario" style={{ maxWidth: '650px', marginTop: '0.5rem' }}>
          <CampoEntrada
            label="NOMBRE DE LA URBANIZACIÓN (3 A 60 CARACTERES)"
            requerido
            valor={nombreForm}
            onChange={(e) => {
              setNombreForm(e.target.value);
              if (errorNombre) setErrorNombre('');
            }}
            error={errorNombre}
            placeholder="EJ: URBANIZACIÓN EL CONDADO, CONJUNTO RESIDENCIAL LOS QUINDES"
            maxlength={60}
          />

          {/* VISTA PREVIA EN VIVO */}
          <div style={{ background: '#f8fafc', border: '1px dashed var(--color-borde)', borderRadius: 'var(--radio)', padding: '0.85rem' }}>
            <span className="texto-tenue" style={{ fontSize: '0.75rem', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
              VISTA PREVIA EN VIVO DEL BANNER DORADO:
            </span>
            <div style={{ background: '#0e2918', borderRadius: '8px', padding: '0.5rem' }}>
              <div className="banner-urbanizacion" style={{ padding: '0.5rem 0' }}>
                <span className="banner-urbanizacion__linea" aria-hidden="true" />
                <span className="banner-urbanizacion__texto">
                  {(nombreForm.trim() || 'NOMBRE DE LA URBANIZACIÓN').toUpperCase()}
                </span>
                <span className="banner-urbanizacion__linea" aria-hidden="true" />
              </div>
            </div>
          </div>

          <button type="submit" className="boton boton--primario" style={{ alignSelf: 'flex-start' }}>
            <Save size={16} /> GUARDAR NOMBRE DE URBANIZACIÓN
          </button>
        </form>
      </section>

      {/* SECCIÓN 2: PRIORIDADES Y PLAZOS DE SEGUIMIENTO */}
      <section className="tarjeta formulario">
        <h2>PRIORIDADES Y PLAZOS DE ATENCIÓN</h2>
        <p className="texto-tenue">
          ESTABLECE CADA CUÁNTOS DÍAS HAY QUE DAR SEGUIMIENTO OBLIGATORIO A UN CASO SEGÚN SU NIVEL DE PRIORIDAD.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          {prioridades.map((prioridad) => (
            <div
              key={prioridad.id}
              className="tarjeta__fila"
              style={{
                padding: '0.75rem',
                border: '1px solid var(--color-borde)',
                borderRadius: 'var(--radio)',
                background: 'var(--color-superficie)',
              }}
            >
              <Insignia texto={prioridad.nombre} color={prioridad.color} />
              <div className="campo campo--horizontal" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="number"
                  min="0"
                  max="90"
                  className="campo-input"
                  style={{ width: '5.5rem', textAlign: 'center' }}
                  value={prioridad.plazoDias}
                  onChange={(e) => manejarCambioPlazo(prioridad.id, Number(e.target.value))}
                />
                <span className="texto-tenue">DÍA(S) DE PLAZO PARA ATENCIÓN</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
