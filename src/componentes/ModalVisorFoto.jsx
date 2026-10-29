import { useEffect } from 'react';
import { X } from 'lucide-react';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';

/**
 * ModalVisorFoto
 * Visor de imagen en pantalla completa con fondo oscuro translúcido y desenfoque,
 * controles accesibles y cierre por Escape o clic exterior.
 */
export default function ModalVisorFoto({ url, titulo, alCerrar }) {
  const { nombreUrbanizacion } = useConfiguracion();

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') alCerrar();
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [alCerrar]);

  if (!url) return null;

  return (
    <div
      className="visor-foto-fondo"
      onClick={alCerrar}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de evidencia fotográfica"
    >
      <div className="visor-foto-barra">
        <button
          type="button"
          className="visor-foto-btn"
          onClick={alCerrar}
          aria-label="Cerrar visor de fotografía"
        >
          <X size={22} />
        </button>
      </div>

      <div onClick={(e) => e.stopPropagation()}>
        {url.startsWith('data:') ||
        url.startsWith('blob:') ||
        url.startsWith('http') ||
        url.startsWith('/') ? (
          <img
            src={url}
            alt={titulo || 'Evidencia fotográfica'}
            className="visor-foto-imagen"
          />
        ) : (
          <div
            style={{
              padding: '2rem',
              textAlign: 'center',
              color: '#cbd5e1',
              background: '#0f172a',
              borderRadius: '12px',
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
            <strong>{url}</strong>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Evidencia fotográfica registrada
            </p>
          </div>
        )}
      </div>

      <div className="visor-foto-pie">
        <span>{titulo || 'Evidencia'} · {nombreUrbanizacion || 'Urbanización'}</span>
      </div>
    </div>
  );
}
