// Funciones pequeñas para trabajar con fechas en formato "AAAA-MM-DD"

function aTextoISO(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${anio}-${mes}-${dia}`;
}

export function hoy() {
  return aTextoISO(new Date());
}

// sumarDias(3) -> dentro de 3 días | sumarDias(-2) -> hace 2 días
export function sumarDias(cantidadDias, fechaBase = hoy()) {
  const fecha = new Date(fechaBase + 'T00:00:00');
  fecha.setDate(fecha.getDate() + cantidadDias);
  return aTextoISO(fecha);
}

// Días que pasaron desde la fecha límite (positivo = atrasado)
export function diasDeAtraso(fechaLimite) {
  if (!fechaLimite) return 0;
  const milisegundosPorDia = 1000 * 60 * 60 * 24;
  const diferencia = new Date(hoy() + 'T00:00:00') - new Date(fechaLimite + 'T00:00:00');
  return Math.round(diferencia / milisegundosPorDia);
}

export function formatearFecha(fechaISO) {
  if (!fechaISO) return '';
  return new Date(fechaISO + 'T00:00:00').toLocaleDateString('es-EC', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
