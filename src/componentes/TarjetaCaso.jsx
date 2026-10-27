import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Camera, FileCheck } from 'lucide-react';
import Insignia from './Insignia';
import ModalVisorFoto from './ModalVisorFoto';
import { estados } from '../datos/datosDemo';
import { useCasos } from '../contextos/ContextoCasos';
import { diasDeAtraso } from '../utilidades/fechas';

export default function TarjetaCaso({ caso }) {
  const { buscarPrioridad } = useCasos();
  const [fotoVisor, setFotoVisor] = useState(null);

  const prioridad = buscarPrioridad(caso.prioridad);
  const estado = estados[caso.estado] || {
    nombre: (caso.estado || '').toUpperCase(),
    color: 'var(--color-borde)',
  };

  const diasAtraso = diasDeAtraso(caso.proximoSeguimiento);
  const estaAtrasado = caso.estado !== 'cerrado' && diasAtraso > 0;

  const ubicacion =
    caso.etapa || caso.callePrimaria
      ? `${caso.etapa ? `${caso.etapa} · ` : ''}${caso.callePrimaria || ''}${caso.calleSecundaria ? ` Y ${caso.calleSecundaria}` : ''}`
      : caso.lote
      ? `LOTE ${caso.lote} · ${caso.calle}`
      : caso.ubicacionTexto || 'SIN UBICACIÓN';

  function verFoto(e, urlFoto, titulo) {
    e.preventDefault();
    e.stopPropagation();
    setFotoVisor({ url: urlFoto, titulo });
  }

  return (
    <>
      <Link
        to={`/casos/${caso.id}`}
        className={`tarjeta tarjeta--enlace ${estaAtrasado ? 'tarjeta--vencida' : ''}`}
        style={{ borderLeftColor: prioridad.color }}
      >
        <div className="tarjeta__fila">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span className="tarjeta__codigo">{caso.codigo}</span>
            {caso.etapa && (
              <span className="insignia-estado-activo" style={{ fontSize: '0.7rem' }}>
                {caso.etapa}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            {caso.fotoInicial && (
              <button
                type="button"
                className="boton boton--contorno"
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}
                onClick={(e) => verFoto(e, caso.fotoInicial, `FOTO INICIAL: ${caso.codigo}`)}
                title="Ver foto inicial"
              >
                <Camera size={13} /> FOTO
              </button>
            )}
            {caso.fotoFinal && (
              <button
                type="button"
                className="boton boton--secundario"
                style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}
                onClick={(e) => verFoto(e, caso.fotoFinal, `FOTO CIERRE: ${caso.codigo}`)}
                title="Ver foto final de cierre"
              >
                <FileCheck size={13} /> CIERRE
              </button>
            )}
            <Insignia texto={estado.nombre} color={estado.color} />
          </div>
        </div>

        <p className="tarjeta__descripcion">{caso.descripcion}</p>

        <div className="tarjeta__fila texto-tenue">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <MapPin size={14} /> {ubicacion}
          </span>
          {estaAtrasado ? (
            <span className="texto-alerta" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Clock size={14} /> {diasAtraso} DÍA(S) DE ATRASO
            </span>
          ) : (
            <Insignia texto={prioridad.nombre} color={prioridad.color} />
          )}
        </div>
      </Link>

      {fotoVisor && (
        <ModalVisorFoto
          url={fotoVisor.url}
          titulo={fotoVisor.titulo}
          alCerrar={() => setFotoVisor(null)}
        />
      )}
    </>
  );
}
