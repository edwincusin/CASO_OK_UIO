// =========================================================
// Catálogo de Lotes - Nomenclatura NUMERO.SUBLOTE
// Expresión regular de validación: /^\d+\.[A-Z0-9]+$/
// Los lotes son un catálogo independiente sin asociación a etapas.
// =========================================================

export const REGEX_LOTE = /^\d+\.[A-Z0-9]+$/;

// Valida si un texto cumple la nomenclatura NUMERO.SUBLOTE (ej: 12.3, 189.CASA1)
export function validarFormatoLote(texto) {
  if (!texto || typeof texto !== 'string') return false;
  const limpio = texto.trim().toUpperCase();
  return REGEX_LOTE.test(limpio);
}

// Ordenamiento natural: primero por el número entero, luego por el sublote
export function ordenarLotesNatural(listaLotes) {
  return [...listaLotes].sort((a, b) => {
    const nombreA = (a.nombre || a).toString().trim().toUpperCase();
    const nombreB = (b.nombre || b).toString().trim().toUpperCase();

    const partesA = nombreA.split('.');
    const partesB = nombreB.split('.');

    const numA = parseInt(partesA[0], 10);
    const numB = parseInt(partesB[0], 10);

    // Comparar número principal numéricamente
    if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
      return numA - numB;
    }

    // Si los números son iguales, comparar el sublote
    const subA = partesA[1] || '';
    const subB = partesB[1] || '';
    return subA.localeCompare(subB, undefined, { numeric: true, sensitivity: 'base' });
  });
}

// 40 lotes de ejemplo con nomenclatura NUMERO.SUBLOTE
const listaInicialNombres = [
  '12.1',
  '12.2',
  '12.3',
  '15.0',
  '45.A',
  '45.B',
  '101.1',
  '101.2',
  '102.0',
  '103.0',
  '185.SUITE1',
  '185.SUITE2',
  '189.CASA1',
  '189.CASA2',
  '220.1',
  '220.2',
  '305.A',
  '305.B',
  '410.0',
  '505.1A',
  '506.0',
  '507.0',
  '508.6',
  '520.0',
  '610.1',
  '610.2',
  '700.0',
  '750.A',
  '750.B',
  '800.1',
  '866.0',
  '867.0',
  '868.0',
  '900.1',
  '900.2',
  '950.0',
  '1001.0',
  '1002.A',
  '1100.1',
  '1200.0',
];

// Generar catálogo de objetos inicial
export const lotesGrandesCatalogo = ordenarLotesNatural(
  listaInicialNombres.map((nombre, index) => ({
    id: index + 1,
    nombre,
    estado: true,
  }))
);
