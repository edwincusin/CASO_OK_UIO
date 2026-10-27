// =========================================================
// Catastro de más de 3,000 Lotes - Urbanización El Condado
// Optimizado para autocompletado y búsqueda instantánea
// =========================================================

function generarCatalogoLotes() {
  const lista = [];
  let idActual = 1;

  // Lotes específicos de los casos demo
  const lotesEspeciales = [
    { nombre: 'LOTE 101', etapa: 'ETAPA 1' },
    { nombre: 'LOTE 102', etapa: 'ETAPA 1' },
    { nombre: 'LOTE 103', etapa: 'ETAPA 1' },
    { nombre: 'LOTE 505.1A', etapa: 'ETAPA 2' },
    { nombre: 'LOTE 506', etapa: 'ETAPA 2' },
    { nombre: 'LOTE 507', etapa: 'ETAPA 2' },
    { nombre: 'LOTE 508.6', etapa: 'ETAPA 2' },
    { nombre: 'LOTE 866', etapa: 'ETAPA 3' },
    { nombre: 'LOTE 867', etapa: 'ETAPA 3' },
    { nombre: 'LOTE 868', etapa: 'ETAPA 3' },
  ];

  lotesEspeciales.forEach((item) => {
    lista.push({
      id: idActual++,
      nombre: item.nombre,
      etapa: item.etapa,
      estado: true,
    });
  });

  // Generación sistemática hasta superar los 3,000 lotes
  // Etapa 1: 1,000 lotes (LOTE 1 a LOTE 1000)
  for (let i = 1; i <= 1000; i++) {
    const nombre = `LOTE ${i}`;
    if (!lista.some((l) => l.nombre === nombre)) {
      lista.push({
        id: idActual++,
        nombre,
        etapa: 'ETAPA 1',
        estado: true,
      });
    }
  }

  // Etapa 2: 1,100 lotes (LOTE 1001 a LOTE 2100)
  for (let i = 1001; i <= 2100; i++) {
    const nombre = `LOTE ${i}`;
    if (!lista.some((l) => l.nombre === nombre)) {
      lista.push({
        id: idActual++,
        nombre,
        etapa: 'ETAPA 2',
        estado: true,
      });
    }
  }

  // Etapa 3: 1,000 lotes (LOTE 2101 a LOTE 3100) + Manzanas
  for (let i = 2101; i <= 3100; i++) {
    const nombre = `LOTE ${i}`;
    if (!lista.some((l) => l.nombre === nombre)) {
      lista.push({
        id: idActual++,
        nombre,
        etapa: 'ETAPA 3',
        estado: true,
      });
    }
  }

  // Subdivisión de manzanas (MZA-01 a MZA-50)
  for (let m = 1; m <= 50; m++) {
    for (let s = 1; s <= 4; s++) {
      lista.push({
        id: idActual++,
        nombre: `MZA-${String(m).padStart(2, '0')} LOTE ${s}`,
        etapa: m <= 20 ? 'ETAPA 1' : m <= 35 ? 'ETAPA 2' : 'ETAPA 3',
        estado: true,
      });
    }
  }

  return lista;
}

export const lotesGrandesCatalogo = generarCatalogoLotes();
