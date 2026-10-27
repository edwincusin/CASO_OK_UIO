import { Navigate } from 'react-router-dom';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import Insignia from '../componentes/Insignia';
import { useSesion } from '../contextos/ContextoSesion';
import { useCasos } from '../contextos/ContextoCasos';
import { useToast } from '../contextos/ContextoToast';
import { puedeVerConfiguracion } from '../utilidades/permisos';

export default function Configuracion() {
  const { usuario } = useSesion();
  const { prioridades, cambiarPlazoPrioridad } = useCasos();
  const { mostrarToast } = useToast();

  if (!puedeVerConfiguracion(usuario)) return <Navigate to="/" replace />;

  function manejarCambio(id, valor) {
    cambiarPlazoPrioridad(id, valor);
    mostrarToast(`PLAZO ACTUALIZADO A ${valor} DÍAS`, 'info');
  }

  return (
    <>
      <EncabezadoPagina titulo="CONFIGURACIÓN DEL SISTEMA" />

      <section className="tarjeta formulario">
        <h2>PRIORIDADES Y PLAZOS DE SEGUIMIENTO</h2>
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
                border: '1px solid #EAEAEA',
                borderRadius: 'var(--radio)',
                background: 'var(--color-superficie)',
              }}
            >
              <Insignia texto={prioridad.nombre} color={prioridad.color} />
              <div className="campo campo--horizontal">
                <input
                  type="number"
                  min="0"
                  max="90"
                  style={{ width: '5rem', textAlign: 'center' }}
                  value={prioridad.plazoDias}
                  onChange={(e) => manejarCambio(prioridad.id, Number(e.target.value))}
                />
                <span className="texto-tenue">DÍA(S) DE PLAZO</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
