/**
 * Valida un número de cédula ecuatoriana mediante el algoritmo de Módulo 10.
 * @param {string} cedula - Cadena de 10 dígitos.
 * @returns {boolean} - True si es válida, False en caso contrario.
 */
export function validarCedulaEcuatoriana(cedula) {
  if (typeof cedula !== 'string') return false;

  // Limpiar espacios y verificar longitud de 10 dígitos numéricos
  const digitos = cedula.trim();
  if (!/^\d{10}$/.test(digitos)) return false;

  // Código de provincia (dos primeros dígitos entre 01 y 24, o 30)
  const provincia = parseInt(digitos.substring(0, 2), 10);
  if ((provincia < 1 || provincia > 24) && provincia !== 30) {
    return false;
  }

  // Tercer dígito debe ser menor a 6 para personas naturales
  const tercerDigito = parseInt(digitos.substring(2, 3), 10);
  if (tercerDigito >= 6) {
    return false;
  }

  // Algoritmo Módulo 10
  const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
  const digitoVerificador = parseInt(digitos.substring(9, 10), 10);
  let suma = 0;

  for (let i = 0; i < 9; i++) {
    let valor = parseInt(digitos.substring(i, i + 1), 10) * coeficientes[i];
    if (valor >= 10) {
      valor -= 9;
    }
    suma += valor;
  }

  const modulo = suma % 10;
  const resultadoEsperado = modulo === 0 ? 0 : 10 - modulo;

  return resultadoEsperado === digitoVerificador;
}
