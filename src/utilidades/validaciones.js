// Permite únicamente números (Cédula y Teléfono)
export function soloNumeros(valor) {
  if (valor === null || valor === undefined) return '';
  return String(valor).replace(/\D/g, '');
}

// Filtra exclusivamente dígitos numéricos: permite letras, tildes, ñ y espacios
export function soloLetras(valor) {
  if (valor === null || valor === undefined) return '';
  // Elimina exclusivamente los números (0-9), permitiendo letras y espacios libremente
  return String(valor).replace(/\d/g, '');
}

// Algoritmo Módulo 10 para Cédula Ecuatoriana
export function validarCedulaEcuatoriana(cedula) {
  const c = String(cedula || '').trim();
  if (c.length !== 10 || !/^\d+$/.test(c)) return false;

  const prov = parseInt(c.substring(0, 2), 10);
  if ((prov < 1 || prov > 24) && prov !== 30) return false;

  const tercerDigito = parseInt(c.substring(2, 3), 10);
  if (tercerDigito >= 6) return false;

  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(c.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let val = parseInt(c.substring(i, i + 1), 10) * coeficientes[i];
    if (val >= 10) val -= 9;
    suma += val;
  }

  const modulo = Math.ceil(suma / 10) * 10 - suma;
  const esperado = modulo === 10 ? 0 : modulo;

  return esperado === digitoVerificador;
}
