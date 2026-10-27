// Transformación automática a mayúsculas
export function aMayusculas(texto) {
  if (texto === null || texto === undefined) return '';
  return String(texto).toUpperCase();
}

// Generador de formato para WhatsApp Versión 3.0
export function generarTextoWhatsappV3(caso) {
  if (!caso) return '';
  return `*URBANIZACIÓN EL CONDADO - NOVEDAD ${caso.codigo}*
*ESTADO:* ${(caso.estado || '').toUpperCase()}
*FECHA:* ${caso.fechaRecepcion || ''}
*PRIORIDAD:* ${(caso.prioridad || '').toUpperCase()}

*DATOS DEL REPORTANTE*
- *NOMBRE:* ${(caso.reportanteNombre || '').toUpperCase()}
- *RELACIÓN:* ${(caso.reportanteTipo || 'PROPIETARIO').toUpperCase()}
- *LOTE REPORTANTE:* ${(caso.reportanteLote || 'N/A').toUpperCase()}
- *CONTACTO:* ${caso.reportanteContacto || 'SIN CONTACTO'}

*UBICACIÓN DE LA NOVEDAD*
- *ETAPA:* ${(caso.etapa || '').toUpperCase()}
- *CALLE PRIMARIA:* ${(caso.callePrimaria || '').toUpperCase()}
- *CALLE SECUNDARIA:* ${(caso.calleSecundaria || 'N/A').toUpperCase()}
- *REFERENCIA:* ${(caso.referenciaUbicacion || caso.ubicacionTexto || 'SIN REFERENCIA').toUpperCase()}

*DETALLE*
- *ÁREA ATENCIÓN:* ${(caso.area || '').toUpperCase()}
- *CATEGORÍA:* ${(caso.categoria || '').toUpperCase()}
- *DESCRIPCIÓN:*
${(caso.descripcion || '').toUpperCase()}`;
}

// Alias para compatibilidad
export const generarTextoWhatsapp = generarTextoWhatsappV3;
