// =========================================================
// Utilidades de Fechas y Horas para CasoOK
// Zona horaria de referencia: America/Guayaquil (Ecuador)
// =========================================================

// Devuelve la fecha y hora actual en formato ISO estándar
export function ahoraISO() {
  return new Date().toISOString();
}

// Devuelve la fecha de hoy en formato "AAAA-MM-DD"
export function hoy() {
  const d = new Date();
  const anio = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Suma o resta días a una fecha base (formato AAAA-MM-DD)
export function sumarDias(cantidadDias, fechaBase = hoy()) {
  const fecha = new Date(fechaBase + (fechaBase.includes('T') ? '' : 'T00:00:00'));
  fecha.setDate(fecha.getDate() + cantidadDias);
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

// Días de atraso con respecto a la fecha límite
export function diasDeAtraso(fechaLimite) {
  if (!fechaLimite) return 0;
  const hoyMs = new Date(hoy() + 'T00:00:00').getTime();
  const limiteMs = new Date(fechaLimite.substring(0, 10) + 'T00:00:00').getTime();
  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diferencia = hoyMs - limiteMs;
  return Math.round(diferencia / milisegundosPorDia);
}

// Formatea fecha en "dd/mm/aaaa"
export function formatearFecha(fechaStr) {
  if (!fechaStr) return '';
  const f = new Date(fechaStr.includes('T') ? fechaStr : fechaStr + 'T00:00:00');
  if (isNaN(f.getTime())) return fechaStr;

  return f.toLocaleDateString('es-EC', {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

// Formatea fecha y hora en "dd/mm/aaaa HH:mm" (24 horas)
export function formatearFechaHora(fechaHoraStr) {
  if (!fechaHoraStr) return '';
  const f = new Date(fechaHoraStr);
  if (isNaN(f.getTime())) return fechaHoraStr;

  // Si solo tiene fecha (ej: YYYY-MM-DD), devolvemos solo fecha
  if (!fechaHoraStr.includes('T') && !fechaHoraStr.includes(':')) {
    return formatearFecha(fechaHoraStr);
  }

  const opciones = {
    timeZone: 'America/Guayaquil',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };

  return f.toLocaleString('es-EC', opciones);
}

// Calcula la duración en milisegundos entre inicio y fin (o ahora si no hay fin)
export function calcularDuracion(inicioISO, finISO) {
  if (!inicioISO) return 0;
  const inicio = new Date(inicioISO).getTime();
  const fin = finISO ? new Date(finISO).getTime() : new Date().getTime();

  if (isNaN(inicio) || isNaN(fin)) return 0;
  return Math.max(0, fin - inicio);
}

// Convierte milisegundos a texto legible como "2 d 5 h 30 min", "5 h 20 min" o "35 min"
export function formatearDuracion(milisegundos) {
  if (milisegundos === null || milisegundos === undefined || isNaN(milisegundos)) {
    return '—';
  }

  const totalMinutos = Math.floor(milisegundos / (1000 * 60));
  if (totalMinutos < 1) return '< 1 min';

  const dias = Math.floor(totalMinutos / (60 * 24));
  const horas = Math.floor((totalMinutos % (60 * 24)) / 60);
  const minutos = totalMinutos % 60;

  const partes = [];
  if (dias > 0) partes.push(`${dias} d`);
  if (horas > 0) partes.push(`${horas} h`);
  if (minutos > 0 || partes.length === 0) partes.push(`${minutos} min`);

  return partes.join(' ');
}

// Devuelve el tiempo de resolución formateado o "En curso: X" si aún no ha cerrado
export function obtenerTiempoResolucion(fechaApertura, fechaCierre, estado) {
  if (!fechaApertura) return '—';
  const estaCerrado = estado === 'cerrado';

  if (estaCerrado && fechaCierre) {
    const duracionMs = calcularDuracion(fechaApertura, fechaCierre);
    return formatearDuracion(duracionMs);
  }

  // Caso en curso (en_proceso o por_confirmar)
  const transcurridoMs = calcularDuracion(fechaApertura, null);
  return `En curso: ${formatearDuracion(transcurridoMs)}`;
}
