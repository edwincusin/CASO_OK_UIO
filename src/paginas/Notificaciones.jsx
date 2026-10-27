import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, ArrowRight } from 'lucide-react';
import EncabezadoPagina from '../componentes/EncabezadoPagina';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';
import { useToast } from '../contextos/ContextoToast';
import { formatearFecha } from '../utilidades/fechas';

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
    mostrarToast('TODAS LAS NOTIFICACIONES MARCADAS COMO LEÍDAS', 'exito');
  }

  return (
    <>
      <EncabezadoPagina titulo="AVISOS Y NOTIFICACIONES">
        <button className="boton boton--contorno" onClick={manejarMarcarTodas}>
          <CheckCheck size={18} /> MARCAR TODO COMO LEÍDO
        </button>
      </EncabezadoPagina>

      <p className="texto-tenue">
        HAGA CLIC EN CUALQUIER NOTIFICACIÓN PARA DIRIGIRSE DIRECTAMENTE AL CASO CORRESPONDIENTE.
      </p>

      <div className="lista">
        {notificaciones.length === 0 && <p className="vacio">NO TIENE AVISOS EN ESTE MOMENTO.</p>}
        {notificaciones.map((n) => (
          <div
            key={n.id}
            onClick={() => abrirCaso(n)}
            className="tarjeta tarjeta--enlace"
            style={{
              cursor: 'pointer',
              borderLeftColor: n.leida ? 'var(--color-borde)' : 'var(--color-alerta)',
              background: n.leida ? 'var(--color-superficie)' : '#FFFBFB',
            }}
          >
            <div className="tarjeta__fila">
              <strong style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: n.leida ? 'inherit' : 'var(--color-alerta)' }}>
                <Bell size={15} /> {n.tipo}
              </strong>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="texto-tenue">{formatearFecha(n.fecha)}</span>
                <span className="boton boton--contorno" style={{ padding: '0.2rem 0.4rem', fontSize: '0.75rem' }}>
                  IR AL CASO <ArrowRight size={12} />
                </span>
              </div>
            </div>
            <p style={{ marginTop: '0.35rem' }}>{n.mensaje}</p>
          </div>
        ))}
      </div>
    </>
  );
}
