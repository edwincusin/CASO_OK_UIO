import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export function exportarCasosAPDF(casosFiltrados, parametros = {}, listaUsuarios = []) {
  const doc = new jsPDF('landscape');

  doc.setFontSize(14);
  doc.setTextColor(42, 140, 75);
  doc.text('URBANIZACIÓN EL QUINDE - REPORTE EJECUTIVO DE NOVEDADES', 14, 15);

  doc.setFontSize(8);
  doc.setTextColor(60, 60, 60);
  const rango = `RANGO: ${parametros.fechaInicio || 'INICIO'} AL ${parametros.fechaFin || 'HOY'}`;
  const cat = `CATEGORÍA: ${parametros.categoria || 'TODAS'}`;
  const ar = `ÁREA: ${parametros.area || 'TODAS'}`;
  const et = `ETAPA: ${parametros.etapa || 'TODAS'}`;
  const usuarioFiltro = listaUsuarios.find((u) => u.id === Number(parametros.usuarioCreadorId));
  const us = `CREADO POR: ${usuarioFiltro ? `${usuarioFiltro.nombre} ${usuarioFiltro.apellido}` : 'TODOS'}`;

  doc.text(`${rango}  |  ${cat}  |  ${ar}  |  ${et}  |  ${us}`, 14, 21);

  const columnas = [
    'CÓDIGO',
    'FECHA',
    'REPORTANTE',
    'LOTE RESID.',
    'ETAPA',
    'CALLE PPAL.',
    'ÁREA',
    'CATEGORÍA',
    'ESTADO',
    'PRIORIDAD',
    'CREADO POR',
  ];

  const filas = casosFiltrados.map((c) => {
    const creador = listaUsuarios.find((u) => u.id === c.registradoPor);
    const nombreCreador = creador ? `${creador.nombre} ${creador.apellido}` : `ID ${c.registradoPor}`;

    return [
      c.codigo || '',
      c.fechaRecepcion || '',
      (c.reportanteNombre || '').toUpperCase(),
      c.reportanteLote || c.lote || '-',
      c.etapa || '-',
      c.callePrimaria || c.calle || '-',
      (c.area || '').toUpperCase(),
      (c.categoria || '').toUpperCase(),
      (c.estado || '').toUpperCase(),
      (c.prioridad || '').toUpperCase(),
      nombreCreador,
    ];
  });

  autoTable(doc, {
    startY: 26,
    head: [columnas],
    body: filas,
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [42, 140, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [248, 250, 248] },
  });

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  doc.save(`Reporte_Condado_V3_${fechaArchivo}.pdf`);
}
