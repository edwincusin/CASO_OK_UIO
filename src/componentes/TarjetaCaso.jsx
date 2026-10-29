import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, Camera, FileCheck, Timer } from 'lucide-react';
import Insignia from './Insignia';
import ModalVisorFoto from './ModalVisorFoto';
import { estados } from '../datos/datosDemo';
import { useCasos } from '../contextos/ContextoCasos';
import { diasDeAtraso, obtenerTiempoResolucion } from '../utilidades/fechas';

/**
 * TarjetaCaso
 * Visualización compacta de una novedad con elevación suave,
 * borde de estado/prioridad y tiempos de atención.
 */
export default function TarjetaCaso({ caso }) {
  const { buscarPrioridad } = useCasos();
  const [fotoVisor, setFotoVisor] = useState(null);

  const prioridad = buscarPrioridad(caso.prioridad);
  const estado = estados[caso.estado] || {
    nombre: (caso.estado || '').toUpperCase().replace('_', ' '),
    color: 'var(--color-borde)',
  };

  const diasAtraso = diasDeAtraso(caso.proximoSeguimiento);
  const estaAtrasado = caso.estado !== 'cerrado' && diasAtraso > 0;
  const tiempoResolucion = obtenerTiempoResolucion(caso);

  const ubicacion =
    caso.etapa || caso.callePrimaria
      ? `${caso.etapa ? `${caso.etapa} · ` : ''}${caso.callePrimaria || ''}${
          caso.calleSecundaria ? ` y ${caso.calleSecundaria}` : ''
        }`
      : caso.reportanteLote || caso.lote
      ? `Lote ${caso.reportanteLote || caso.lote} · ${caso.callePrimaria || caso.calle || 'Principal'}`
      : caso.ubicacionTexto || 'Sin ubicación';

  function verFoto(e, urlFoto, titulo) {
    e.preventDefault();
    e.stopPropagation();
    setFotoVisor({ url: urlFoto, titulo });
  }

  const estadoClase =
    caso.estado === 'cerrado'
      ? 'tarjeta-caso--cerrado'
      : caso.estado === 'por_confirmar'
      ? 'tarjeta-caso--confirmar'
      : 'tarjeta-caso--proceso';

  return (
    <>
      <Link
        to={`/casos/${caso.id}`}
        className={`tarjeta-caso ${estadoClase} ${estaAtrasado ? 'tarjeta-caso--vencida' : ''}`}
        style={prioridad?.color ? { borderLeftColor: prioridad.color } : undefined}
      >
        <div className="tarjeta-caso__fila-superior">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="tarjeta-caso__codigo">{caso.codigo}</span>
            {caso.etapa && (
              <span className="badge badge--activo" style={{ fontSize: '0.7rem' }}>
                {caso.etapa}
              </span>
            )}
            <span
              className="texto-tenue texto-mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
            >
              <Timer size={13} /> {tiempoResolucion}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {caso.fotoInicial && (
              <button
                type="button"
                className="boton boton--sm boton--secundario"
                style={{ padding: '0 8px', minHeight: '30px' }}
                onClick={(e) => verFoto(e, caso.fotoInicial, `Foto Inicial: ${caso.codigo}`)}
                title="Ver evidencia inicial"
              >
                <Camera size={13} /> <span>Foto</span>
              </button>
            )}
            {caso.fotoFinal && (
              <button
                type="button"
                className="boton boton--sm boton--primario"
                style={{ padding: '0 8px', minHeight: '30px' }}
                onClick={(e) => verFoto(e, caso.fotoFinal, `Foto Cierre: ${caso.codigo}`)}
                title="Ver evidencia de cierre"
              >
                <FileCheck size={13} /> <span>Cierre</span>
              </button>
            )}
            <Insignia
              texto={estado.nombre}
              variante={caso.estado}
              color={estado.color}
            />
          </div>
        </div>

        <p className="tarjeta-caso__descripcion">{caso.descripcion}</p>

        <div className="tarjeta-caso__meta">
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} /> {ubicacion}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {estaAtrasado ? (
              <span
                style={{
                  color: 'var(--color-peligro)',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Clock size={14} /> {diasAtraso} día(s) de atraso
              </span>
            ) : (
              <Insignia
                texto={prioridad.nombre}
                variante={caso.prioridad}
                color={prioridad.color}
              />
            )}
          </div>
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
