import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Undo2,
  Camera,
  FileCheck,
  FileText,
  Phone,
  MapPin,
  Send,
  AlertCircle,
  Home,
  Layers,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Insignia from '../componentes/Insignia';
import VistaPreviaImagen from '../componentes/VistaPreviaImagen';
import { useCasos } from '../contextos/ContextoCasos';
import { useSesion } from '../contextos/ContextoSesion';
import { useToast } from '../contextos/ContextoToast';
import { estados } from '../datos/datosDemo';
import { puedeAtenderCaso, puedeConfirmarCaso, puedeAgregarSeguimiento } from '../utilidades/permisos';
import { generarTextoWhatsappV3, aMayusculas } from '../utilidades/texto';
import { formatearFecha, diasDeAtraso } from '../utilidades/fechas';

export default function CasoDetalle() {
  const { idCaso } = useParams();
  const { usuario } = useSesion();
  const { casos, buscarPrioridad, agregarSeguimiento } = useCasos();
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

  const estado = estados[caso.estado] || { nombre: (caso.estado || '').toUpperCase(), color: 'var(--color-borde)' };
  const prioridad = buscarPrioridad(caso.prioridad);
  const estaAtrasado = caso.estado !== 'cerrado' && diasDeAtraso(caso.proximoSeguimiento) > 0;
  const telefonoWhatsapp = (caso.reportanteContacto || '').replace(/^0/, '593').replace(/\D/g, '');

  function copiarWhatsApp() {
    const texto = generarTextoWhatsappV3(caso);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(texto);
    }
    setCopiado(true);
    mostrarToast('FORMATO WHATSAPP V3 COPIADO AL PORTAPAPELES', 'exito');
    setTimeout(() => setCopiado(false), 2500);
  }

  function marcarAtendido(e) {
    e.preventDefault();
    // En V3 la foto final es opcional
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
    mostrarToast('CASO MARCADO COMO ATENDIDO (POR CONFIRMAR)', 'exito');
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

  function devolverCaso() {
    if (!notaAtencion.trim()) {
      setMensajeErrorDevolucion('DEBE ESCRIBIR UNA NOTA DE OBSERVACIÓN PARA DEVOLVER EL CASO');
      mostrarToast('ESCRIBA LA NOTA DE OBSERVACIÓN', 'alerta');
      return;
    }

    agregarSeguimiento(
      caso.id,
      usuario,
      'devolucion',
      `DEVOLUCIÓN: ${notaAtencion}`,
      'en_proceso'
    );
    setNotaAtencion('');
    setMensajeErrorDevolucion('');
    mostrarToast('CASO DEVUELTO A ESTADO EN PROCESO', 'alerta');
  }

  function guardarNotaSimple(e) {
    e.preventDefault();
    if (!textoNota.trim()) return;
    agregarSeguimiento(caso.id, usuario, 'nota', textoNota.trim());
    setTextoNota('');
    mostrarToast('NOTA DE SEGUIMIENTO REGISTRADA', 'exito');
  }

  return (
    <div className="caso-detalle">
      <Link to="/casos" className="texto-tenue" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.5rem' }}>
        <ArrowLeft size={14} /> VOLVER A CASOS
      </Link>

      <div className="encabezado-acciones">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <h1 style={{ margin: 0 }}>{caso.codigo}</h1>
          {caso.etapa && <span className="insignia-estado-activo">{caso.etapa}</span>}
          <Insignia texto={estado.nombre} color={estado.color} />
          <Insignia texto={`PRIORIDAD ${prioridad.nombre}`} color={prioridad.color} />
        </div>
        <button className="boton boton--secundario" onClick={copiarWhatsApp}>
          {copiado ? <Check size={16} /> : <Copy size={16} />} COPIAR PARA WHATSAPP
        </button>
      </div>

      <section className="tarjeta" style={{ marginBottom: '1rem' }}>
        <div className="tarjeta__fila texto-tenue">
          <span>RECIBIDO EL: {formatearFecha(caso.fechaRecepcion)}</span>
          {caso.proximoSeguimiento && caso.estado !== 'cerrado' && (
            <span>PRÓXIMO SEGUIMIENTO: {formatearFecha(caso.proximoSeguimiento)}</span>
          )}
        </div>
        {estaAtrasado && (
          <p className="texto-alerta" style={{ marginTop: '0.35rem' }}>
            SEGUIMIENTO VENCIDO HACE {diasDeAtraso(caso.proximoSeguimiento)} DÍA(S)
          </p>
        )}
        <p style={{ marginTop: '0.75rem', fontSize: '1rem' }}>{caso.descripcion}</p>
      </section>

      {/* DETALLES TERRITORIALES Y REPORTANTE V3 */}
      <section className="tarjeta datos" style={{ marginBottom: '1rem' }}>
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
          <div className="datos__titulo">ÁREA Y CATEGORÍA</div>
          <strong>{caso.area}</strong> · {caso.categoria}
        </div>

        {/* EVIDENCIAS FOTOGRÁFICAS CON MINIATURA INTERACTIVA 80x80 */}
        <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #EAEAEA', paddingTop: '0.75rem' }}>
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

      {/* FORMULARIO DE ATENCIÓN (FOTO FINAL OPCIONAL EN V3) */}
      {puedeAtenderCaso(usuario, caso) && caso.estado !== 'por_confirmar' && (
        <form onSubmit={marcarAtendido} className="tarjeta formulario" style={{ marginBottom: '1rem', borderLeft: '5px solid var(--color-secundario)' }}>
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
          <button type="submit" className="boton boton--primario">
            <CheckCircle2 size={16} /> MARCAR COMO ATENDIDO
          </button>
        </form>
      )}

      {/* CONFIRMACIÓN Y DEVOLUCIÓN PARA OPERADOR ADMIN Y SUPERUSUARIO */}
      {puedeConfirmarCaso(usuario, caso) && (
        <div className="tarjeta formulario" style={{ marginBottom: '1rem', borderLeft: '5px solid var(--color-resuelto)' }}>
          <h3>CONFIRMACIÓN DE SOLUCIÓN</h3>
          <p className="texto-tenue">
            ESTE CASO FUE ATENDIDO Y ESPERA CONFIRMACIÓN DE ADMINISTRACIÓN O SUPERUSUARIO.
          </p>

          <div className="campo">
            <label>NOTA DE OBSERVACIÓN (OBLIGATORIA SI VA A DEVOLVER)</label>
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
            <button type="button" className="boton boton--alerta" onClick={devolverCaso}>
              <Undo2 size={16} /> DEVOLVER CON NOTA
            </button>
          </div>
        </div>
      )}

      {/* SEGUIMIENTO GENERAL */}
      {caso.estado !== 'cerrado' && puedeAgregarSeguimiento(usuario) && (
        <form className="tarjeta formulario" onSubmit={guardarNotaSimple} style={{ marginBottom: '1rem' }}>
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

      {/* HISTORIAL DE SEGUIMIENTO */}
      <section className="tarjeta">
        <h2>HISTORIAL DE SEGUIMIENTO</h2>
        {caso.seguimientos.length === 0 && (
          <p className="texto-tenue">AÚN NO HAY SEGUIMIENTOS REGISTRADOS.</p>
        )}
        <ul className="linea-tiempo">
          {caso.seguimientos.map((seg) => (
            <li key={seg.id} className="linea-tiempo__item">
              <div>
                <strong>{seg.nota}</strong>
              </div>
              <div className="texto-tenue" style={{ marginTop: '0.2rem' }}>
                {seg.autor} · {formatearFecha(seg.fecha)} {seg.tipo && `· [${seg.tipo.toUpperCase()}]`}
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
