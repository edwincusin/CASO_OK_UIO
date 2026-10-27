import { X, ZoomIn } from 'lucide-react';

export default function ModalVisorFoto({ url, titulo, alCerrar }) {
  if (!url) return null;

  return (
    <div className="modal-overlay" onClick={alCerrar} style={{ zIndex: 1100 }}>
      <div
        className="modal-contenido modal-contenido--imagen"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '720px',
          width: '95%',
          background: '#1A1A1A',
          color: '#FFFFFF',
          borderRadius: 'var(--radio)',
          padding: '1.25rem',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '0.95rem' }}>
            <ZoomIn size={18} />
            <span>{titulo || 'VISOR DE FOTOGRAFÍA'}</span>
          </div>
          <button
            type="button"
            className="boton boton--contorno"
            onClick={alCerrar}
            style={{ color: '#FFF', borderColor: '#444', padding: '0.3rem 0.6rem' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ width: '100%', minHeight: '260px', maxHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#0D0D0D', borderRadius: '8px' }}>
          {url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('http') || url.startsWith('/') ? (
            <img
              src={url}
              alt={titulo}
              style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
            />
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#BBB' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>📷</div>
              <strong>{url}</strong>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.25rem' }}>
                EVIDENCIA FOTOGRÁFICA REGISTRADA EN EL SISTEMA
              </p>
            </div>
          )}
        </div>

        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: '#AAA' }}>
          <span>URBANIZACIÓN EL CONDADO - REGISTRO VISUAL</span>
          <button
            type="button"
            className="boton boton--secundario"
            onClick={alCerrar}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
          >
            CERRAR VISOR
          </button>
        </div>
      </div>
    </div>
  );
}
