import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight, BellOff } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';
import { useToast } from '../contextos/ContextoToast';
import { formatearFecha } from '../utilidades/fechas';

/**
 * Notificaciones
 * Centro de avisos de vencimientos, cambios de estado y notas de seguimiento.
 */
export default function Notificaciones() {
  const { notificaciones, marcarLeida, marcarTodasLeidas } = useNotificaciones();
  const { mostrarToast } = useToast();
  const navegar = useNavigate();

  function abrirCaso(n) {
    marcarLeida(n.id);
    if (n.idCaso) {
      navegar(`/casos/${n.idCaso}`);
    }
  }

  function manejarMarcarTodas() {
    marcarTodasLeidas();
    mostrarToast('Todas las notificaciones marcadas como leídas', 'exito');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--espacio-4)' }}>
      <EncabezadoPagina
        titulo="Avisos y Notificaciones"
        subtitulo="Alertas de seguimiento, vencimientos de plazo y actualizaciones en tiempo real"
      >
        <button
          type="button"
          className="boton boton--secundario"
          onClick={manejarMarcarTodas}
        >
          <CheckCheck size={18} />
          <span>Marcar Todo como Leído</span>
        </button>
      </EncabezadoPagina>

      <p className="texto-tenue">
        Haga clic en cualquier notificación para dirigirse directamente al caso correspondiente.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {notificaciones.length === 0 ? (
          <div className="tarjeta estado-vacio">
            <BellOff size={36} className="texto-tenue" />
            <h2 className="estado-vacio__titulo">No tiene avisos pendientes</h2>
            <p className="estado-vacio__texto">
              Todas las novedades están al día sin alertas pendientes.
            </p>
          </div>
        ) : (
          notificaciones.map((n) => (
            <div
              key={n.id}
              onClick={() => abrirCaso(n)}
              className="tarjeta tarjeta--interactiva"
              style={{
                borderLeft: `4px solid ${
                  n.leida ? 'var(--color-borde)' : 'var(--color-peligro)'
                }`,
                background: n.leida ? 'var(--color-superficie)' : '#fffbfb',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '8px',
                  flexWrap: 'wrap',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 700,
                    color: n.leida ? 'var(--color-texto-principal)' : 'var(--color-peligro)',
                  }}
                >
                  <Bell size={16} />
                  <span>{n.tipo}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="texto-tenue texto-mono" style={{ fontSize: '0.8rem' }}>
                    {formatearFecha(n.fecha)}
                  </span>
                  <span
                    className="boton boton--sm boton--fantasma"
                    style={{ fontSize: '0.78rem' }}
                  >
                    <span>Ir al caso</span>
                    <ArrowRight size={13} />
                  </span>
                </div>
              </div>

              <p style={{ marginTop: '4px', color: 'var(--color-texto-secundario)' }}>
                {n.mensaje}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
