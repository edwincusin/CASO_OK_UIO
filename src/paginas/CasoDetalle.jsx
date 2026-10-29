import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Copy,
  Check,
  CheckCircle2,
  Undo2,
  Phone,
  MapPin,
  Send,
  AlertCircle,
  Home,
  Timer,
  Clock,
  Printer,
  Camera,
  CameraOff,
  FileText,
  Upload,
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import Insignia from '../componentes/Insignia';
import ModalVisorFoto from '../componentes/ModalVisorFoto';
import { useCasos } from '../contextos/ContextoCasos';
import { useSesion } from '../contextos/ContextoSesion';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { useToast } from '../contextos/ContextoToast';
import { estados } from '../datos/datosDemo';
import {
  puedeAtenderCaso,
  puedeConfirmarCaso,
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
 * MiniaturaEvidencia
 * Muestra la miniatura con aspect-ratio 1:1 y zoom al cursor.
 * Si la imagen falla al cargar (onError), renderiza un recuadro de reemplazo
 * con icono y texto "Sin imagen" en lugar de un marco roto.
 */
function MiniaturaEvidencia({ src, titulo, alHacerClic }) {
  const [errorCarga, setErrorCarga] = useState(false);

  if (errorCarga || !src) {
    return (
      <div className="galeria-item galeria-item--fallback" title="Evidencia no disponible">
        <CameraOff size={22} />
        <span className="galeria-item__texto-fallback">Sin imagen</span>
      </div>
    );
  }

  const esUrlValida =
    src.startsWith('data:') ||
    src.startsWith('blob:') ||
    src.startsWith('http') ||
    src.startsWith('/');

  if (!esUrlValida) {
    return (
      <div
        className="galeria-item galeria-item--fallback"
        onClick={alHacerClic}
        title="Clic para ver detalle"
      >
        <Camera size={22} />
        <span
          className="galeria-item__texto-fallback"
          style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        >
          {src}
        </span>
      </div>
    );
  }

  return (
    <div
      className="galeria-item"
      onClick={alHacerClic}
      title="Clic para ampliar fotografía"
    >
      <img
        src={src}
        alt={titulo || 'Evidencia fotográfica'}
        className="galeria-item__img"
        onError={() => setErrorCarga(true)}
      />
    </div>
  );
}

/**
 * CasoDetalle
 * Gestión y seguimiento del caso:
 * - Cabecera con código, badges e impresión/WhatsApp.
 * - Cuadrícula de 2 columnas con etiqueta pequeña arriba y valor grande debajo.
 * - Botones de contacto telefónico y WhatsApp en pastilla.
 * - Galería de evidencias con aspect-ratio y fallback contra imágenes rotas.
 * - Historial vertical en línea de tiempo con autor, fecha y tiempos transcurridos.
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
  const [fotoVisor, setFotoVisor] = useState(null);

  const caso = casos.find((c) => c.id === Number(idCaso));
  if (!caso) {
    return (
      <div className="tarjeta estado-vacio">
        <AlertCircle size={36} className="texto-tenue" />
        <h2 className="estado-vacio__titulo">No se encontró el caso solicitado</h2>
        <p className="estado-vacio__texto">
          El código de caso no existe en el sistema o fue retirado.
        </p>
        <Link to="/casos" className="boton boton--primario">
          Volver al listado de casos
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
    mostrarToast('Formato oficial WhatsApp copiado al portapapeles', 'exito');
    setTimeout(() => setCopiado(false), 2500);
  }

  function imprimirPDF() {
    exportarCasoAPDF(caso, usuario, nombreUrbanizacion);
    mostrarToast('Reporte PDF del caso generado exitosamente', 'exito');
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
    mostrarToast('Caso marcado como atendido (pasó a Por Confirmar)', 'exito');
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
    mostrarToast('Caso confirmado y cerrado exitosamente', 'exito');
  }

  function manejarDevolverCaso() {
    if (!notaAtencion.trim()) {
      setMensajeErrorDevolucion(
        'Debe escribir una nota explicativa obligatoria para devolver el caso a proceso'
      );
      mostrarToast('Escriba la nota explicativa obligatoria', 'alerta');
      return;
    }

    const res = devolverAProceso(caso.id, usuario, notaAtencion);
    if (res.exito) {
      setNotaAtencion('');
      setMensajeErrorDevolucion('');
      mostrarToast('Caso devuelto al estado En Proceso', 'info');
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
    mostrarToast('Nota de seguimiento registrada', 'exito');
  }

  // Historial con tiempos
  const seguimientosConTiempos = (caso.seguimientos || []).map((seg, index, lista) => {
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
    <div className="detalle-caso">
      <Link
        to="/casos"
        className="boton boton--fantasma boton--sm"
        style={{ alignSelf: 'flex-start' }}
      >
        <ArrowLeft size={16} />
        <span>Volver a la lista de casos</span>
      </Link>

      {/* 1. CABECERA DEL CASO */}
      <section className="detalle-caso__cabecera">
        <div className="detalle-caso__fila-superior">
          <div className="detalle-caso__codigo-grupo">
            <h1 className="detalle-caso__codigo">{caso.codigo}</h1>
            {caso.etapa && <span className="badge badge--activo">{caso.etapa}</span>}
            <Insignia
              texto={estado.nombre}
              variante={caso.estado}
              color={estado.color}
            />
            <Insignia
              texto={`Prioridad ${prioridad.nombre}`}
              variante={caso.prioridad}
              color={prioridad.color}
            />
          </div>

          <div className="detalle-caso__acciones-cabecera">
            <button
              type="button"
              className="boton boton--secundario"
              onClick={imprimirPDF}
              title="Descargar informe del caso en PDF A4"
            >
              <Printer size={16} />
              <span>Imprimir PDF</span>
            </button>
            <button
              type="button"
              className="boton boton--primario"
              onClick={copiarWhatsApp}
              title="Copiar plantilla para WhatsApp"
            >
              {copiado ? <Check size={16} /> : <Copy size={16} />}
              <span>{copiado ? 'Copiado' : 'Copiar para WhatsApp'}</span>
            </button>
          </div>
        </div>

        {/* Tiempos de atención */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
            paddingTop: '12px',
            borderTop: '1px solid var(--color-borde-suave)',
          }}
        >
          <div className="dato-item">
            <span className="dato-item__etiqueta">Apertura</span>
            <span className="dato-item__valor texto-mono" style={{ fontSize: '0.92rem' }}>
              {caso.fechaHoraApertura
                ? formatearFechaHora(caso.fechaHoraApertura)
                : formatearFecha(caso.fechaRecepcion)}
            </span>
          </div>

          <div className="dato-item">
            <span className="dato-item__etiqueta">Cierre definitivo</span>
            <span className="dato-item__valor texto-mono" style={{ fontSize: '0.92rem' }}>
              {caso.fechaHoraCierre ? formatearFechaHora(caso.fechaHoraCierre) : '— (En curso)'}
            </span>
          </div>

          <div className="dato-item">
            <span className="dato-item__etiqueta">Tiempo de resolución</span>
            <span
              className="dato-item__valor texto-mono"
              style={{
                fontSize: '0.92rem',
                color:
                  caso.estado === 'cerrado'
                    ? 'var(--color-exito)'
                    : 'var(--color-esmeralda-oscuro)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <Timer size={14} /> {tiempoResolucion}
            </span>
          </div>

          {caso.proximoSeguimiento && caso.estado !== 'cerrado' && (
            <div className="dato-item">
              <span className="dato-item__etiqueta">Próximo seguimiento</span>
              <span className="dato-item__valor texto-mono" style={{ fontSize: '0.92rem' }}>
                {formatearFecha(caso.proximoSeguimiento)}
              </span>
            </div>
          )}
        </div>

        {estaAtrasado && (
          <div
            style={{
              background: 'var(--color-peligro-fondo)',
              color: 'var(--color-peligro-texto)',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Clock size={16} />
            <span>Seguimiento vencido hace {diasDeAtraso(caso.proximoSeguimiento)} día(s)</span>
          </div>
        )}
      </section>

      {/* 2. CUADRÍCULA DE DATOS A 2 COLUMNAS (PROMPT B) */}
      <section className="cuadricula-datos-2col">
        <div className="dato-item">
          <span className="dato-item__etiqueta">Reportante</span>
          <div className="dato-item__valor">{caso.reportanteNombre}</div>
          <span className="texto-tenue" style={{ fontSize: '0.78rem' }}>
            Tipo: {caso.reportanteTipo || 'Propietario'}
          </span>
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Lote del residente</span>
          <div
            className="dato-item__valor"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Home size={16} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span className="texto-mono">{caso.reportanteLote || caso.lote || 'Sin lote'}</span>
          </div>
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Contacto telefónico</span>
          {caso.reportanteContacto ? (
            <div className="dato-item__acciones-contacto">
              <a
                href={`tel:${caso.reportanteContacto}`}
                className="boton boton--sm boton--secundario boton--pastilla"
              >
                <Phone size={13} />
                <span>{caso.reportanteContacto}</span>
              </a>
              <a
                href={`https://wa.me/${telefonoWhatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="boton boton--sm boton--exito boton--pastilla"
              >
                <FaWhatsapp />
                <span>WhatsApp</span>
              </a>
            </div>
          ) : (
            <span className="texto-tenue">Sin contacto telefónico</span>
          )}
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Ubicación territorial de la novedad</span>
          <div
            className="dato-item__valor"
            style={{ display: 'flex', alignItems: 'flex-start', gap: '6px' }}
          >
            <MapPin
              size={16}
              style={{ color: 'var(--color-esmeralda-medio)', marginTop: '3px', flexShrink: 0 }}
            />
            <span>
              {caso.etapa ? `${caso.etapa} · ` : ''}
              {caso.callePrimaria || caso.calle || 'Calle Principal'}
              {caso.calleSecundaria ? ` y ${caso.calleSecundaria}` : ''}
            </span>
          </div>
          {(caso.referenciaUbicacion || caso.ubicacionTexto) && (
            <span className="texto-tenue" style={{ fontSize: '0.8rem', marginTop: '2px' }}>
              Ref: {caso.referenciaUbicacion || caso.ubicacionTexto}
            </span>
          )}
        </div>

        <div className="dato-item">
          <span className="dato-item__etiqueta">Área responsable y Categoría</span>
          <div className="dato-item__valor">
            <strong>{caso.area}</strong> · {caso.categoria}
          </div>
        </div>

        <div className="dato-item dato-item--ancho-completo">
          <span className="dato-item__etiqueta">Descripción detallada del caso</span>
          <p
            className="dato-item__valor"
            style={{
              fontSize: '0.95rem',
              fontWeight: 400,
              lineHeight: 1.6,
              background: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--color-borde-suave)',
            }}
          >
            {caso.descripcion}
          </p>
        </div>

        {/* 3. GALERÍA DE EVIDENCIAS EN GRID (PROMPT B) */}
        <div
          className="dato-item dato-item--ancho-completo"
          style={{ paddingTop: '12px', borderTop: '1px solid var(--color-borde-suave)' }}
        >
          <span className="dato-item__etiqueta">Evidencias Fotográficas y Documentos</span>
          <div className="galeria-evidencias" style={{ marginTop: '8px' }}>
            {/* Foto inicial */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="texto-tenue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                FOTO INICIAL
              </span>
              <MiniaturaEvidencia
                src={caso.fotoInicial}
                titulo={`Foto Inicial: ${caso.codigo}`}
                alHacerClic={() =>
                  setFotoVisor({ url: caso.fotoInicial, titulo: `Foto Inicial: ${caso.codigo}` })
                }
              />
            </div>

            {/* Foto final de cierre */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span className="texto-tenue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                FOTO FINAL DE CIERRE
              </span>
              <MiniaturaEvidencia
                src={caso.fotoFinal}
                titulo={`Foto Final: ${caso.codigo}`}
                alHacerClic={() =>
                  setFotoVisor({ url: caso.fotoFinal, titulo: `Foto Final: ${caso.codigo}` })
                }
              />
            </div>

            {/* Oficio PDF si existe */}
            {caso.pdfInicial && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span className="texto-tenue" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                  OFICIO PDF
                </span>
                <div
                  className="galeria-item galeria-item--fallback"
                  style={{ background: '#f8fafc', cursor: 'default' }}
                >
                  <FileText size={22} style={{ color: 'var(--color-esmeralda-medio)' }} />
                  <span
                    className="galeria-item__texto-fallback"
                    style={{ fontSize: '0.68rem', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                  >
                    {caso.pdfInicial}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. BLOQUES DE ACCIÓN CON ESTRUCTURA VERTICAL (PROMPT B) */}
      {puedeAtenderCaso(usuario, caso) && caso.estado === 'en_proceso' && (
        <form
          onSubmit={marcarAtendido}
          className="formulario__seccion tarjeta-accion"
        >
          <h2 className="formulario__seccion-titulo">
            <CheckCircle2 size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>Marcar como atendido ({caso.area})</span>
          </h2>
          <p className="texto-tenue">
            La foto final de cierre es opcional para no demorar la entrega del personal operativo en territorio.
          </p>

          {/* Campo de archivo estilizado según Prompt B */}
          <div className="campo-grupo">
            <span className="campo-label">Foto final de cierre (Opcional)</span>
            <label className="zona-archivo" htmlFor="fotoFinal">
              <input
                id="fotoFinal"
                type="file"
                accept="image/*"
                className="zona-archivo__input-nativo"
                onChange={(e) => setFotoFinal(e.target.files ? e.target.files[0] : null)}
              />
              <div className="zona-archivo__contenedor">
                <span className="zona-archivo__icono">
                  <Upload size={22} />
                </span>
                <span className="zona-archivo__texto-principal">
                  Seleccionar o arrastrar fotografía de cierre
                </span>
                <span className="zona-archivo__texto-secundario">
                  Formatos JPG, PNG o WebP
                </span>
              </div>
            </label>
            {fotoFinal && (
              <div className="zona-archivo__vista-previa">
                <img
                  src={URL.createObjectURL(fotoFinal)}
                  alt="Vista previa final"
                  className="zona-archivo__miniatura"
                />
                <span className="zona-archivo__nombre-archivo">{fotoFinal.name}</span>
                <button
                  type="button"
                  className="boton boton--sm boton--peligro"
                  onClick={() => setFotoFinal(null)}
                >
                  Quitar
                </button>
              </div>
            )}
          </div>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="notaAtencion">
              Nota de atención / Trabajo realizado
            </label>
            <textarea
              id="notaAtencion"
              rows={3}
              placeholder="Describa el trabajo realizado para resolver la novedad..."
              value={notaAtencion}
              onChange={(e) => setNotaAtencion(aMayusculas(e.target.value))}
              className="campo-textarea"
            />
          </div>

          <button
            type="submit"
            className="boton boton--primario"
            style={{ alignSelf: 'flex-start' }}
          >
            <CheckCircle2 size={16} />
            <span>Marcar como atendido (pasar a Por Confirmar)</span>
          </button>
        </form>
      )}

      {/* Confirmación y Devolución para Administración y Superusuario */}
      {puedeConfirmarCaso(usuario, caso) && (
        <div className="formulario__seccion tarjeta-accion" style={{ borderTopColor: 'var(--color-info)' }}>
          <h2 className="formulario__seccion-titulo">
            <CheckCircle2 size={18} style={{ color: 'var(--color-info)' }} />
            <span>Confirmación de solución o devolución</span>
          </h2>
          <p className="texto-tenue">
            Este caso fue atendido en territorio y requiere validación antes de su cierre definitivo.
          </p>

          <div className="campo-grupo">
            <label className="campo-label" htmlFor="notaObservacion">
              Nota de observación (Obligatoria si va a devolver el caso a proceso)
            </label>
            <textarea
              id="notaObservacion"
              rows={3}
              placeholder="Escriba observaciones de validación o el motivo de devolución..."
              value={notaAtencion}
              onChange={(e) => {
                setNotaAtencion(aMayusculas(e.target.value));
                if (mensajeErrorDevolucion) setMensajeErrorDevolucion('');
              }}
              className="campo-textarea"
            />
            {mensajeErrorDevolucion && (
              <span className="campo-mensaje-error">
                <AlertCircle size={14} />
                <span>{mensajeErrorDevolucion}</span>
              </span>
            )}
          </div>

          <div className="grupo-botones">
            <button
              type="button"
              className="boton boton--primario"
              onClick={confirmarSolucion}
            >
              <CheckCircle2 size={16} />
              <span>Confirmar solución (Cerrar caso)</span>
            </button>
            <button
              type="button"
              className="boton boton--peligro"
              onClick={manejarDevolverCaso}
            >
              <Undo2 size={16} />
              <span>Devolver a proceso con nota</span>
            </button>
          </div>
        </div>
      )}

      {/* Agregar nota de seguimiento general */}
      {caso.estado !== 'cerrado' && puedeAgregarSeguimiento(usuario) && (
        <form
          className="formulario__seccion"
          onSubmit={guardarNotaSimple}
        >
          <h2 className="formulario__seccion-titulo">
            <Send size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
            <span>Agregar nota de seguimiento</span>
          </h2>
          <div className="campo-grupo">
            <textarea
              rows={2}
              placeholder="Registre un avance, observación o seguimiento del caso..."
              value={textoNota}
              onChange={(e) => setTextoNota(aMayusculas(e.target.value))}
              className="campo-textarea"
            />
          </div>
          <button
            type="submit"
            className="boton boton--secundario"
            style={{ alignSelf: 'flex-start' }}
          >
            <Send size={16} />
            <span>Guardar nota</span>
          </button>
        </form>
      )}

      {/* 5. HISTORIAL VERTICAL EN LÍNEA DE TIEMPO (PROMPT B) */}
      <section className="tarjeta">
        <h2 className="tarjeta__titulo">
          <Clock size={18} style={{ color: 'var(--color-esmeralda-medio)' }} />
          <span>Historial de seguimiento cronológico</span>
        </h2>

        {seguimientosConTiempos.length === 0 ? (
          <p className="texto-tenue">Aún no hay notas ni seguimientos registrados.</p>
        ) : (
          <ul className="linea-tiempo">
            {seguimientosConTiempos.map((seg) => (
              <li key={seg.id} className="linea-tiempo__item">
                <span className="linea-tiempo__nodo" aria-hidden="true" />
                <div className="linea-tiempo__tarjeta">
                  <div className="linea-tiempo__meta">
                    <span className="linea-tiempo__autor">{seg.autor}</span>
                    <span className="linea-tiempo__fecha">
                      {seg.fechaHora
                        ? formatearFechaHora(seg.fechaHora)
                        : formatearFecha(seg.fecha)}
                    </span>
                  </div>

                  <p className="linea-tiempo__nota">{seg.nota}</p>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap',
                      marginTop: '4px',
                    }}
                  >
                    {seg.tipo && (
                      <span className="badge badge--activo" style={{ fontSize: '0.68rem' }}>
                        {seg.tipo}
                      </span>
                    )}

                    {seg.tiempoDesdeApertura && (
                      <span
                        className="texto-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--color-esmeralda-medio)',
                          background: 'var(--color-esmeralda-tenue)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Desde apertura: {seg.tiempoDesdeApertura}
                      </span>
                    )}

                    {seg.tiempoDesdeAnterior && (
                      <span
                        className="texto-mono"
                        style={{
                          fontSize: '0.72rem',
                          color: '#475569',
                          background: '#f1f5f9',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        Desde anterior: {seg.tiempoDesdeAnterior}
                      </span>
                    )}
                  </div>

                  {seg.foto && (
                    <div style={{ marginTop: '8px', width: '80px' }}>
                      <MiniaturaEvidencia
                        src={seg.foto}
                        titulo={`Evidencia ${seg.tipo || 'Seguimiento'}`}
                        alHacerClic={() =>
                          setFotoVisor({
                            url: seg.foto,
                            titulo: `Evidencia ${seg.tipo || 'Seguimiento'}`,
                          })
                        }
                      />
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Visor de foto en pantalla completa */}
      {fotoVisor && (
        <ModalVisorFoto
          url={fotoVisor.url}
          titulo={fotoVisor.titulo}
          alCerrar={() => setFotoVisor(null)}
        />
      )}
    </div>
  );
}
