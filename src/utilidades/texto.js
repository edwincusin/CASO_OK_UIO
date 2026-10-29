import { formatearFechaHora, obtenerTiempoResolucion } from './fechas';

/**
 * texto.js
 * Funciones de manipulación de texto y formato para compartir en WhatsApp.
 */

// Transformación consistente a mayúsculas
export function aMayusculas(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto).toUpperCase();
}

// Generador de formato para WhatsApp oficial de CASOOK
export function generarTextoWhatsappV3(caso, nombreUrbanizacion = 'Nombre de la Urbanización') {
  if (!caso) return '';

  const urbanizacionMayus = aMayusculas(nombreUrbanizacion);
  const estadoFormateado = (caso.estado || '').toUpperCase().replace('_', ' ');
  const duracionTexto = obtenerTiempoResolucion(caso);
  const fechaApertura = caso.fechaHoraApertura
    ? formatearFechaHora(caso.fechaHoraApertura)
    : caso.fechaRecepcion || 'N/D';

  return `*${urbanizacionMayus} · CASOOK - NOVEDAD ${caso.codigo}*
*ESTADO:* ${estadoFormateado}
*APERTURA:* ${fechaApertura}
*TIEMPO:* ${duracionTexto}
*PRIORIDAD:* ${(caso.prioridad || '').toUpperCase()}

*DATOS DEL REPORTANTE*
- *NOMBRE:* ${(caso.reportanteNombre || '').toUpperCase()}
- *RELACIÓN:* ${(caso.reportanteTipo || 'PROPIETARIO').toUpperCase()}
- *LOTE REPORTANTE:* ${(caso.reportanteLote || caso.lote || 'N/A').toUpperCase()}
- *CONTACTO:* ${caso.reportanteContacto || 'SIN CONTACTO'}

*UBICACIÓN DE LA NOVEDAD*
- *ETAPA:* ${(caso.etapa || '').toUpperCase()}
- *CALLE PRIMARIA:* ${(caso.callePrimaria || caso.calle || '').toUpperCase()}
- *CALLE SECUNDARIA:* ${(caso.calleSecundaria || 'N/A').toUpperCase()}
- *REFERENCIA:* ${(caso.referenciaUbicacion || caso.ubicacionTexto || 'SIN REFERENCIA').toUpperCase()}

*DETALLE*
- *ÁREA ATENCIÓN:* ${(caso.area || '').toUpperCase()}
- *CATEGORÍA:* ${(caso.categoria || '').toUpperCase()}
- *DESCRIPCIÓN:*
${(caso.descripcion || '').toUpperCase()}`;
}

// Alias para compatibilidad hacia atrás
export const generarTextoWhatsapp = generarTextoWhatsappV3;
