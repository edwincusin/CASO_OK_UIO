import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Undo2,
  FileCheck,
  FileText,
  Phone,
  MapPin,
  Send,
  AlertCircle,
  Home,
  Timer,
  Clock,
  Printer,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Insignia from '../componentes/Insignia';
import VistaPreviaImagen from '../componentes/VistaPreviaImagen';
import { useCasos } from '../contextos/ContextoCasos';
import { useSesion } from '../contextos/ContextoSesion';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { useToast } from '../contextos/ContextoToast';
import { estados } from '../datos/datosDemo';
import {
  puedeAtenderCaso,
  puedeConfirmarCaso,
  puedeDevolverAProceso,
  puedeAgregarSeguimiento,
} from '../utilidades/permisos';
import { generarTextoWhatsappV3, aMayusculas } from '../utilidades/texto';
import {
  formatearFecha,
  formatearFechaHora,
  diasDeAtraso,
  obtenerTiempoResolucion,
  calcularDuracion,
  formatearDuracion,
} from '../utilidades/fechas';
import { exportarCasoAPDF } from '../utilidades/generadorPdf';

/**
 * CasoDetalle
 * Pantalla completa de gestión del caso:
 * - Tiempos: Apertura, Cierre y Tiempo de Resolución ("En curso: X" si activo).
 * - Historial de notas con "tiempo desde apertura" y "tiempo desde la nota anterior".
 * - Botón "Imprimir PDF" para exportar el caso en A4 vertical con fotos e historial.
 * - Acción de "Devolver a proceso" con nota obligatoria para Superusuario y Administración.
 */

export default function CasoDetalle() {
  const { idCaso } = useParams();
  const { usuario } = useSesion();
  const { casos, buscarPrioridad, agregarSeguimiento, devolverAProceso } = useCasos();
  const { nombreUrbanizacion } = useConfiguracion();
  const { mostrarToast } = useToast();

  const [fotoFinal, setFotoFinal] = useState(null);
  const [notaAtencion, setNotaAtencion] = useState('');
  const [textoNota, setTextoNota] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [mensajeErrorDevolucion, setMensajeErrorDevolucion] = useState('');

  const caso = casos.find((c) => c.id === Number(idCaso));
  if (!caso) {
    return (
      <div className="tarjeta vacio">
        <p>NO SE ENCONTRÓ EL CASO SOLICITADO.</p>
        <Link to="/casos" className="boton boton--contorno" style={{ marginTop: '1rem' }}>
          VOLVER AL LISTADO
        </Link>
      </div>
    );
  }

  const estado = estados[caso.estado] || {
    nombre: (caso.estado || '').toUpperCase().replace('_', ' '),
    color: 'var(--color-borde)',
  };
  const prioridad = buscarPrioridad(caso.prioridad);
  const estaAtrasado = caso.estado !== 'cerrado' && diasDeAtraso(caso.proximoSeguimiento) > 0;
  const telefonoWhatsapp = (caso.reportanteContacto || '').replace(/^0/, '593').replace(/\D/g, '');
  const tiempoResolucion = obtenerTiempoResolucion(caso);

  function copiarWhatsApp() {
    const texto = generarTextoWhatsappV3(caso, nombreUrbanizacion);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(texto);
    }
    setCopiado(true);
    mostrarToast('FORMATO OFICIAL WHATSAPP COPIADO AL PORTAPAPELES', 'exito');
    setTimeout(() => setCopiado(false), 2500);
  }

  function imprimirPDF() {
    exportarCasoAPDF(caso, usuario, nombreUrbanizacion);
    mostrarToast('REPORTE PDF DEL CASO GENERADO EXITOSAMENTE', 'exito');
  }

  function marcarAtendido(e) {
    e.preventDefault();
    agregarSeguimiento(
      caso.id,
      usuario,
      'atendido',
      notaAtencion || 'TRABAJO REALIZADO SATISFACTORIAMENTE',
      'por_confirmar',
      fotoFinal ? fotoFinal.name : null
    );
    setFotoFinal(null);
    setNotaAtencion('');
    mostrarToast('CASO MARCADO COMO ATENDIDO (PASÓ A POR CONFIRMAR)', 'exito');
  }

  function confirmarSolucion() {
    agregarSeguimiento(
      caso.id,
      usuario,
      'confirmacion',
      notaAtencion || 'SOLUCIÓN CONFIRMADA Y VALIDADA CON EL RESIDENTE',
      'cerrado'
    );
    setNotaAtencion('');
    mostrarToast('CASO CERRADO Y CONFIRMADO EXITOSAMENTE', 'exito');
  }

  function manejarDevolverCaso() {
    if (!notaAtencion.trim()) {
      setMensajeErrorDevolucion('DEBE ESCRIBIR UNA NOTA EXPLICATIVA OBLIGATORIA PARA DEVOLVER EL CASO');
      mostrarToast('ESCRIBA LA NOTA EXPLICATIVA OBLIGATORIA', 'alerta');
      return;
    }

    const res = devolverAProceso(caso.id, usuario, notaAtencion);
    if (res.exito) {
      setNotaAtencion('');
      setMensajeErrorDevolucion('');
      mostrarToast('CASO DEVUELTO AL ESTADO EN PROCESO', 'info');
    } else {
      setMensajeErrorDevolucion(res.mensaje);
      mostrarToast(res.mensaje, 'alerta');
    }
  }

  function guardarNotaSimple(e) {
    e.preventDefault();
    if (!textoNota.trim()) return;
    agregarSeguimiento(caso.id, usuario, 'nota', textoNota.trim());
    setTextoNota('');
    mostrarToast('NOTA DE SEGUIMIENTO REGISTRADA', 'exito');
  }

  // Cálculo de tiempos para el historial
  // caso.seguimientos está ordenado del más nuevo al más antiguo: [nota3, nota2, nota1]
  const seguimientosConTiempos = (caso.seguimientos || []).map((seg, index, lista) => {
    // La nota cronológicamente anterior es lista[index + 1]
    const notaAnterior = lista[index + 1];

    let tiempoDesdeApertura = null;
    let tiempoDesdeAnterior = null;

    if (seg.fechaHora && caso.fechaHoraApertura) {
      const msApertura = calcularDuracion(caso.fechaHoraApertura, seg.fechaHora);
      tiempoDesdeApertura = msApertura >= 0 ? formatearDuracion(msApertura) : '0 min';
    }

    if (seg.fechaHora && notaAnterior?.fechaHora) {
      const msAnterior = calcularDuracion(notaAnterior.fechaHora, seg.fechaHora);
      tiempoDesdeAnterior = msAnterior >= 0 ? formatearDuracion(msAnterior) : '0 min';
    }

    return {
      ...seg,
      tiempoDesdeApertura,
      tiempoDesdeAnterior,
    };
  });

  return (
    <div className="caso-detalle" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Link
        to="/casos"
        className="texto-tenue"
        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={15} /> VOLVER AL LISTADO DE CASOS
      </Link>

      {/* Encabezado con código, estado, prioridad y botones de acción */}
      <div className="encabezado-acciones">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>{caso.codigo}</h1>
          {caso.etapa && <span className="insignia-estado-activo">{caso.etapa}</span>}
          <Insignia texto={estado.nombre} color={estado.color} />
          <Insignia texto={`PRIORIDAD ${prioridad.nombre}`} color={prioridad.color} />
        </div>

        {/* Acciones principales: WhatsApp e Imprimir PDF */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button type="button" className="boton boton--contorno" onClick={imprimirPDF}>
            <Printer size={16} /> IMPRIMIR PDF
          </button>
          <button type="button" className="boton boton--secundario" onClick={copiarWhatsApp}>
            {copiado ? <Check size={16} /> : <Copy size={16} />} COPIAR PARA WHATSAPP
          </button>
        </div>
      </div>

      {/* Tarjeta de tiempos y control */}
      <section className="tarjeta">
        <div className="tarjeta__fila" style={{ gap: '0.75rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="texto-tenue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              FECHA Y HORA DE APERTURA:
            </span>
            <strong>
              {caso.fechaHoraApertura
                ? formatearFechaHora(caso.fechaHoraApertura)
                : formatearFecha(caso.fechaRecepcion)}
            </strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="texto-tenue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              FECHA Y HORA DE CIERRE:
            </span>
            <strong>
              {caso.fechaHoraCierre
                ? formatearFechaHora(caso.fechaHoraCierre)
                : '—'}
            </strong>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span className="texto-tenue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
              TIEMPO DE RESOLUCIÓN:
            </span>
            <span style={{ fontWeight: 800, color: caso.estado === 'cerrado' ? 'var(--color-resuelto)' : 'var(--color-info)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Timer size={15} /> {tiempoResolucion}
            </span>
          </div>

          {caso.proximoSeguimiento && caso.estado !== 'cerrado' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
              <span className="texto-tenue" style={{ fontSize: '0.75rem', fontWeight: 700 }}>
                PRÓXIMO SEGUIMIENTO:
              </span>
              <span>{formatearFecha(caso.proximoSeguimiento)}</span>
            </div>
          )}
        </div>

        {estaAtrasado && (
          <p className="texto-alerta" style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Clock size={15} /> SEGUIMIENTO VENCIDO HACE {diasDeAtraso(caso.proximoSeguimiento)} DÍA(S)
          </p>
        )}

        <div style={{ marginTop: '0.85rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-borde)' }}>
          <span className="texto-tenue" style={{ fontSize: '0.78rem', fontWeight: 700 }}>
            DESCRIPCIÓN DE LA NOVEDAD:
          </span>
          <p style={{ marginTop: '0.25rem', fontSize: '0.95rem', color: '#1e293b' }}>{caso.descripcion}</p>
        </div>
      </section>

      {/* DETALLES TERRITORIALES Y REPORTANTE */}
      <section className="tarjeta datos">
        <div>
          <div className="datos__titulo">REPORTANTE</div>
          <strong>{caso.reportanteNombre}</strong>{' '}
          <span className="texto-tenue">({caso.reportanteTipo || 'PROPIETARIO'})</span>
        </div>

        <div>
          <div className="datos__titulo">LOTE DEL RESIDENTE</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <Home size={15} />
            <strong>{caso.reportanteLote || caso.lote || 'SIN LOTE'}</strong>
          </div>
        </div>

        <div>
          <div className="datos__titulo">CONTACTO TELEFÓNICO</div>
          {caso.reportanteContacto ? (
            <span className="acciones" style={{ alignItems: 'center', marginTop: '0.2rem' }}>
              <a href={`tel:${caso.reportanteContacto}`} className="boton boton--contorno" style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem' }}>
                <Phone size={14} /> {caso.reportanteContacto}
              </a>
              <a
                href={`https://wa.me/${telefonoWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="boton boton--contorno"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.82rem', color: '#128C7E' }}
              >
                <FaWhatsapp /> WHATSAPP
              </a>
            </span>
          ) : (
            <span className="texto-tenue">SIN CONTACTO</span>
          )}
        </div>

        <div>
          <div className="datos__titulo">UBICACIÓN EXACTA DE LA NOVEDAD</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <MapPin size={15} />
            <span>
              {caso.etapa ? `${caso.etapa} · ` : ''}
              {caso.callePrimaria || caso.calle || 'CALLE PRINCIPAL'}
              {caso.calleSecundaria ? ` Y ${caso.calleSecundaria}` : ''}
            </span>
          </div>
          {(caso.referenciaUbicacion || caso.ubicacionTexto) && (
            <div className="texto-tenue" style={{ marginTop: '0.2rem' }}>
              Ref: {caso.referenciaUbicacion || caso.ubicacionTexto}
            </div>
          )}
        </div>

        <div>
          <div className="datos__titulo">ÁREA RESPONSABLE Y CATEGORÍA</div>
          <strong>{caso.area}</strong> · {caso.categoria}
        </div>

        {/* EVIDENCIAS FOTOGRÁFICAS EN MINIATURA 80x80 */}
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid var(--color-borde)', paddingTop: '0.75rem' }}>
          <div className="datos__titulo" style={{ marginBottom: '0.5rem' }}>EVIDENCIAS FOTOGRÁFICAS (MINIATURAS AMPLIABLES)</div>
          <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
            <div>
              <span className="texto-tenue" style={{ fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
                FOTO INICIAL
              </span>
              <VistaPreviaImagen urlExistente={caso.fotoInicial} titulo={`FOTO INICIAL: ${caso.codigo}`} />
            </div>

            <div>
              <span className="texto-tenue" style={{ fontWeight: 600, fontSize: '0.75rem', display: 'block', marginBottom: '0.2rem' }}>
                FOTO FINAL DE CIERRE
              </span>
              <VistaPreviaImagen urlExistente={caso.fotoFinal} titulo={`FOTO FINAL: ${caso.codigo}`} />
            </div>

            {caso.pdfInicial && (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span className="texto-tenue" style={{ fontWeight: 600, fontSize: '0.75rem', marginBottom: '0.2rem' }}>
                  OFICIO PDF
                </span>
                <div className="tarjeta" style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FileText size={16} />
                  <span>{caso.pdfInicial}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FORMULARIO DE ATENCIÓN PARA OPERADORES Y MANTENIMIENTO */}
      {puedeAtenderCaso(usuario, caso) && caso.estado === 'en_proceso' && (
        <form onSubmit={marcarAtendido} className="tarjeta formulario" style={{ borderLeft: '5px solid var(--color-secundario)' }}>
          <h3>MARCAR COMO ATENDIDO ({caso.area.toUpperCase()})</h3>
          <p className="texto-tenue">
            La foto final de cierre es opcional para no bloquear el despacho rápido del personal de servicio.
          </p>
          <div className="campo">
            <label htmlFor="fotoFinal">FOTO FINAL DE CIERRE (OPCIONAL)</label>
            <input
              id="fotoFinal"
              type="file"
              accept="image/*"
              onChange={(e) => setFotoFinal(e.target.files ? e.target.files[0] : null)}
            />
            {fotoFinal && (
              <VistaPreviaImagen archivo={fotoFinal} alEliminar={() => setFotoFinal(null)} titulo="FOTO FINAL" />
            )}
          </div>
          <div className="campo">
            <label htmlFor="notaAtencion">NOTA DE ATENCIÓN / TRABAJO REALIZADO</label>
            <textarea
              id="notaAtencion"
              rows={2}
              placeholder="DETALLE EL TRABAJO REALIZADO PARA RESOLVER LA NOVEDAD..."
              value={notaAtencion}
              onChange={(e) => setNotaAtencion(aMayusculas(e.target.value))}
            />
          </div>
          <button type="submit" className="boton boton--primario" style={{ alignSelf: 'flex-start' }}>
            <CheckCircle2 size={16} /> MARCAR COMO ATENDIDO (PASAR A POR CONFIRMAR)
          </button>
        </form>
      )}

      {/* CONFIRMACIÓN Y DEVOLUCIÓN PARA OPERADOR ADMIN Y SUPERUSUARIO */}
      {puedeConfirmarCaso(usuario, caso) && (
        <div className="tarjeta formulario" style={{ borderLeft: '5px solid var(--color-resuelto)' }}>
          <h3>CONFIRMACIÓN DE SOLUCIÓN</h3>
          <p className="texto-tenue">
            ESTE CASO FUE ATENDIDO Y ESPERA CONFIRMACIÓN DE ADMINISTRACIÓN O SUPERUSUARIO.
          </p>

          <div className="campo">
            <label>NOTA DE OBSERVACIÓN (OBLIGATORIA SI VA A DEVOLVER EL CASO)</label>
            <textarea
              rows={2}
              placeholder="ESCRIBA OBSERVACIONES O DETALLES DE LA CONFIRMACIÓN/DEVOLUCIÓN..."
              value={notaAtencion}
              onChange={(e) => {
                setNotaAtencion(aMayusculas(e.target.value));
                if (mensajeErrorDevolucion) setMensajeErrorDevolucion('');
              }}
            />
          </div>

          {mensajeErrorDevolucion && (
            <div style={{ color: 'var(--color-alerta)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
              <AlertCircle size={16} />
              <span>{mensajeErrorDevolucion}</span>
            </div>
          )}

          <div className="acciones">
            <button type="button" className="boton boton--primario" onClick={confirmarSolucion}>
              <CheckCircle2 size={16} /> CONFIRMAR SOLUCIÓN (CERRAR CASO)
            </button>
            <button type="button" className="boton boton--alerta" onClick={manejarDevolverCaso}>
              <Undo2 size={16} /> DEVOLVER A PROCESO CON NOTA
            </button>
          </div>
        </div>
      )}

      {/* AGREGAR NOTA DE SEGUIMIENTO GENERAL */}
      {caso.estado !== 'cerrado' && puedeAgregarSeguimiento(usuario) && (
        <form className="tarjeta formulario" onSubmit={guardarNotaSimple}>
          <h3>AGREGAR NOTA DE SEGUIMIENTO</h3>
          <div className="campo">
            <textarea
              rows={2}
              placeholder="REGISTRE UNA NOTA O SEGUIMIENTO AL CASO..."
              value={textoNota}
              onChange={(e) => setTextoNota(aMayusculas(e.target.value))}
            />
          </div>
          <div className="acciones">
            <button type="submit" className="boton boton--contorno">
              <Send size={16} /> GUARDAR NOTA
            </button>
          </div>
        </form>
      )}

      {/* HISTORIAL DE SEGUIMIENTO CON TIEMPO TRANSCURRIDO */}
      <section className="tarjeta">
        <h2>HISTORIAL DE SEGUIMIENTO Y TIEMPOS</h2>
        {seguimientosConTiempos.length === 0 && (
          <p className="texto-tenue">AÚN NO HAY SEGUIMIENTOS REGISTRADOS.</p>
        )}
        <ul className="linea-tiempo">
          {seguimientosConTiempos.map((seg) => (
            <li key={seg.id} className="linea-tiempo__item">
              <div>
                <strong>{seg.nota}</strong>
              </div>
              <div className="texto-tenue" style={{ marginTop: '0.2rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'center' }}>
                <span>{seg.autor}</span>
                <span>·</span>
                <span>
                  {seg.fechaHora ? formatearFechaHora(seg.fechaHora) : formatearFecha(seg.fecha)}
                </span>
                {seg.tipo && <span>· [{seg.tipo.toUpperCase()}]</span>}

                {/* Tiempos transcurridos si existen */}
                {seg.tiempoDesdeApertura && (
                  <span style={{ color: 'var(--color-primario)', fontWeight: 600, background: '#f0fdf4', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    Desde apertura: {seg.tiempoDesdeApertura}
                  </span>
                )}
                {seg.tiempoDesdeAnterior && (
                  <span style={{ color: '#475569', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                    Desde nota anterior: {seg.tiempoDesdeAnterior}
                  </span>
                )}
              </div>
              {seg.foto && (
                <div style={{ marginTop: '0.35rem' }}>
                  <VistaPreviaImagen urlExistente={seg.foto} titulo={`EVIDENCIA ${seg.tipo || 'SEGUIMIENTO'}`} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
