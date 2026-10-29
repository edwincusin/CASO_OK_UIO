import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  formatearFechaHora,
  obtenerTiempoResolucion,
  calcularDuracion,
  formatearDuracion,
  ahoraISO,
} from './fechas';

/**
 * generadorPdf.js
 * Generación de reportes ejecutivos en PDF para CASOOK utilizando jsPDF y jspdf-autotable.
 * - Reporte general de auditoría en orientación horizontal con resumen estadístico.
 * - Reporte de caso individual en A4 vertical con historial, tiempos y fotografías.
 */

// REPORTE GENERAL DE AUDITORÍA
export function exportarCasosAPDF(
  casosFiltrados = [],
  parametros = {},
  listaUsuarios = [],
  nombreUrbanizacion = 'Nombre de la Urbanización'
) {
  const doc = new jsPDF('landscape');
  const urbanizacionMayus = (nombreUrbanizacion || 'NOMBRE DE LA URBANIZACIÓN').toUpperCase();

  // Encabezado
  doc.setFontSize(15);
  doc.setTextColor(17, 50, 29); // Verde esmeralda oscuro
  doc.setFont('helvetica', 'bold');
  doc.text(`CASOOK · ${urbanizacionMayus}`, 14, 14);

  doc.setFontSize(10);
  doc.setTextColor(90, 90, 90);
  doc.setFont('helvetica', 'normal');
  doc.text('REPORTE EJECUTIVO DE NOVEDADES Y SEGUIMIENTO', 14, 20);

  // Filtros aplicados
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  const rango = `RANGO: ${parametros.fechaInicio || 'INICIO'} AL ${parametros.fechaFin || 'HOY'}`;
  const cat = `CATEGORÍA: ${parametros.categoria || 'TODAS'}`;
  const ar = `ÁREA: ${parametros.area || 'TODAS'}`;
  const et = `ETAPA: ${parametros.etapa || 'TODAS'}`;
  const usuarioFiltro = listaUsuarios.find((u) => u.id === Number(parametros.usuarioCreadorId));
  const us = `CREADO POR: ${usuarioFiltro ? `${usuarioFiltro.nombre} ${usuarioFiltro.apellido}` : 'TODOS'}`;

  doc.text(`${rango}  |  ${cat}  |  ${ar}  |  ${et}  |  ${us}`, 14, 26);

  // Columnas requeridas
  const columnas = [
    'CÓDIGO',
    'APERTURA',
    'CIERRE',
    'TIEMPO',
    'ESTADO',
    'PRIORIDAD',
    'REPORTANTE',
    'LOTE',
    'ETAPA',
    'CALLE PPAL.',
    'CATEGORÍA',
    'ÁREA',
    'CREADO POR',
  ];

  // Métricas para el resumen inferior
  let totalCerrados = 0;
  let totalEnProceso = 0;
  let totalPorConfirmar = 0;
  let sumaMilisegundosCerrados = 0;

  const filas = casosFiltrados.map((c) => {
    if (c.estado === 'cerrado') {
      totalCerrados += 1;
      const ms = calcularDuracion(c.fechaHoraApertura || c.fechaRecepcion, c.fechaHoraCierre);
      if (ms > 0) sumaMilisegundosCerrados += ms;
    } else if (c.estado === 'por_confirmar') {
      totalPorConfirmar += 1;
    } else {
      totalEnProceso += 1;
    }

    const creador = listaUsuarios.find((u) => u.id === c.registradoPor);
    const nombreCreador = creador ? `${creador.nombre} ${creador.apellido}` : `ID ${c.registradoPor}`;

    const fechaApertura = c.fechaHoraApertura
      ? formatearFechaHora(c.fechaHoraApertura)
      : c.fechaRecepcion || '—';

    const fechaCierre = c.fechaHoraCierre
      ? formatearFechaHora(c.fechaHoraCierre)
      : '—';

    const tiempoResolucion = obtenerTiempoResolucion(c);

    return [
      c.codigo || '',
      fechaApertura,
      fechaCierre,
      tiempoResolucion,
      (c.estado || '').toUpperCase().replace('_', ' '),
      (c.prioridad || '').toUpperCase(),
      (c.reportanteNombre || '').toUpperCase(),
      c.reportanteLote || c.lote || '—',
      c.etapa || '—',
      c.callePrimaria || c.calle || '—',
      (c.categoria || '').toUpperCase(),
      (c.area || '').toUpperCase(),
      nombreCreador,
    ];
  });

  autoTable(doc, {
    startY: 30,
    head: [columnas],
    body: filas,
    styles: { fontSize: 7, cellPadding: 2, overflow: 'linebreak' },
    headStyles: {
      fillColor: [17, 50, 29],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: { fillColor: [247, 250, 248] },
    margin: { left: 14, right: 14 },
  });

  // Resumen al final de la tabla
  const promedioMs = totalCerrados > 0 ? Math.round(sumaMilisegundosCerrados / totalCerrados) : 0;
  const promedioTexto = totalCerrados > 0 ? formatearDuracion(promedioMs) : 'N/A';

  const posYFinal = (doc).lastAutoTable ? (doc).lastAutoTable.finalY + 8 : 180;

  // Si queda muy poco espacio en la página, agregar una nueva página para el resumen
  if (posYFinal > 175) {
    doc.addPage();
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 50, 29);
    doc.text('RESUMEN ESTADÍSTICO DEL REPORTE', 14, 20);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(
      `TOTAL CASOS: ${casosFiltrados.length}  |  CERRADOS: ${totalCerrados}  |  EN PROCESO: ${totalEnProceso}  |  POR CONFIRMAR: ${totalPorConfirmar}  |  TIEMPO PROMEDIO RESOLUCIÓN (CERRADOS): ${promedioTexto}`,
      14,
      27
    );
  } else {
    doc.setFillColor(243, 246, 243);
    doc.roundedRect(14, posYFinal, 269, 14, 2, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 50, 29);
    doc.text(
      `RESUMEN: Total: ${casosFiltrados.length}  |  Cerrados: ${totalCerrados}  |  En Proceso: ${totalEnProceso}  |  Por Confirmar: ${totalPorConfirmar}  |  Tiempo Promedio de Resolución (Cerrados): ${promedioTexto}`,
      18,
      posYFinal + 9
    );
  }

  // Numeración de páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `CASOOK · Página ${i} de ${totalPaginas} · Documento Oficial`,
      14,
      205
    );
  }

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  doc.save(`CasoOK_Reporte_${fechaArchivo}.pdf`);
}

// REPORTE DE UN SOLO CASO (A4 VERTICAL)
export function exportarCasoAPDF(
  caso,
  autorGenerador = null,
  nombreUrbanizacion = 'Nombre de la Urbanización'
) {
  if (!caso) return;

  const doc = new jsPDF('portrait', 'mm', 'a4');
  const urbanizacionMayus = (nombreUrbanizacion || 'NOMBRE DE LA URBANIZACIÓN').toUpperCase();
  const fechaGeneracion = formatearFechaHora(ahoraISO());
  const nombreAutor = autorGenerador
    ? `${autorGenerador.nombre || ''} ${autorGenerador.apellido || ''}`.trim()
    : 'SISTEMA CASOOK';

  // 1. Encabezado
  doc.setFontSize(16);
  doc.setTextColor(17, 50, 29);
  doc.setFont('helvetica', 'bold');
  doc.text('CASOOK', 14, 16);

  doc.setFontSize(9);
  doc.setTextColor(202, 138, 4); // Acento dorado
  doc.text(`URBANIZACIÓN: ${urbanizacionMayus}`, 14, 22);

  doc.setFontSize(12);
  doc.setTextColor(40, 40, 40);
  doc.setFont('helvetica', 'bold');
  doc.text(`REPORTE DE CASO: ${caso.codigo}`, 14, 30);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Generado el: ${fechaGeneracion} por ${nombreAutor}`, 14, 35);

  // Línea divisoria
  doc.setDrawColor(210, 215, 210);
  doc.line(14, 38, 196, 38);

  // 2. Datos del caso y tiempos
  const fechaApertura = caso.fechaHoraApertura
    ? formatearFechaHora(caso.fechaHoraApertura)
    : caso.fechaRecepcion || '—';

  const fechaCierre = caso.fechaHoraCierre
    ? formatearFechaHora(caso.fechaHoraCierre)
    : '—';

  const tiempoResolucion = obtenerTiempoResolucion(caso);

  autoTable(doc, {
    startY: 42,
    head: [['DATOS PRINCIPALES DEL CASO', 'TIEMPOS Y SEGUIMIENTO']],
    body: [
      [
        `ESTADO: ${(caso.estado || '').toUpperCase().replace('_', ' ')}\nPRIORIDAD: ${(caso.prioridad || '').toUpperCase()}\nCATEGORÍA: ${(caso.categoria || '').toUpperCase()}\nÁREA RESPONSABLE: ${(caso.area || '').toUpperCase()}`,
        `APERTURA: ${fechaApertura}\nCIERRE: ${fechaCierre}\nTIEMPO: ${tiempoResolucion}\nPRÓXIMO CONTROL: ${caso.proximoSeguimiento || 'N/A'}`,
      ],
      [
        `REPORTANTE: ${(caso.reportanteNombre || '').toUpperCase()}\nRELACIÓN: ${(caso.reportanteTipo || 'PROPIETARIO').toUpperCase()}\nLOTE RESIDENTE: ${(caso.reportanteLote || caso.lote || 'N/A').toUpperCase()}\nCONTACTO: ${caso.reportanteContacto || 'SIN CONTACTO'}`,
        `ETAPA: ${(caso.etapa || 'N/A').toUpperCase()}\nCALLE PPAL: ${(caso.callePrimaria || caso.calle || 'N/A').toUpperCase()}\nCALLE SECUNDARIA: ${(caso.calleSecundaria || 'N/A').toUpperCase()}\nREFERENCIA: ${(caso.referenciaUbicacion || caso.ubicacionTexto || 'SIN REFERENCIA').toUpperCase()}`,
      ],
    ],
    theme: 'grid',
    styles: { fontSize: 8, cellPadding: 3, textColor: [30, 30, 30] },
    headStyles: { fillColor: [17, 50, 29], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 91 }, 1: { cellWidth: 91 } },
    margin: { left: 14, right: 14 },
  });

  let posY = (doc).lastAutoTable ? (doc).lastAutoTable.finalY + 6 : 90;

  // 3. Descripción
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(17, 50, 29);
  doc.text('DESCRIPCIÓN DE LA NOVEDAD:', 14, posY);

  posY += 4;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(50, 50, 50);

  const descripcionLineas = doc.splitTextToSize(caso.descripcion || 'SIN DESCRIPCIÓN', 182);
  doc.text(descripcionLineas, 14, posY);

  posY += descripcionLineas.length * 4 + 6;

  // 4. Fotos en miniatura (Manejo con try/catch seguro)
  const hayFotoInicial = Boolean(caso.fotoInicial);
  const hayFotoFinal = Boolean(caso.fotoFinal);

  if (hayFotoInicial || hayFotoFinal) {
    if (posY > 230) {
      doc.addPage();
      posY = 20;
    }

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(17, 50, 29);
    doc.text('EVIDENCIAS FOTOGRÁFICAS:', 14, posY);
    posY += 4;

    const anchoFoto = 45;
    const altoFoto = 35;

    // Foto inicial
    if (hayFotoInicial) {
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('FOTO INICIAL DE APERTURA', 14, posY + 3);

      let imagenAgregada = false;
      if (
        caso.fotoInicial.startsWith('data:image') ||
        caso.fotoInicial.startsWith('blob:') ||
        caso.fotoInicial.startsWith('http')
      ) {
        try {
          doc.addImage(caso.fotoInicial, 'JPEG', 14, posY + 5, anchoFoto, altoFoto);
          imagenAgregada = true;
        } catch (e) {
          console.warn('No se pudo cargar la imagen inicial en el PDF:', e);
        }
      }

      if (!imagenAgregada) {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(14, posY + 5, anchoFoto, altoFoto, 'FD');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text(caso.fotoInicial, 16, posY + 22);
      }
    }

    // Foto final
    if (hayFotoFinal) {
      const offsetFinal = hayFotoInicial ? 65 : 14;
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(80, 80, 80);
      doc.text('FOTO FINAL DE CIERRE', offsetFinal, posY + 3);

      let imagenFinalAgregada = false;
      if (
        caso.fotoFinal.startsWith('data:image') ||
        caso.fotoFinal.startsWith('blob:') ||
        caso.fotoFinal.startsWith('http')
      ) {
        try {
          doc.addImage(caso.fotoFinal, 'JPEG', offsetFinal, posY + 5, anchoFoto, altoFoto);
          imagenFinalAgregada = true;
        } catch (e) {
          console.warn('No se pudo cargar la imagen final en el PDF:', e);
        }
      }

      if (!imagenFinalAgregada) {
        doc.setDrawColor(200, 200, 200);
        doc.setFillColor(245, 245, 245);
        doc.rect(offsetFinal, posY + 5, anchoFoto, altoFoto, 'FD');
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(120, 120, 120);
        doc.text(caso.fotoFinal, offsetFinal + 2, posY + 22);
      }
    }

    posY += altoFoto + 10;
  }

  // 5. Historial de seguimiento en tabla
  if (posY > 230) {
    doc.addPage();
    posY = 20;
  }

  const columnasHistorial = ['FECHA Y HORA', 'AUTOR', 'NOTA / ACTIVIDAD', 'DESDE APERTURA'];
  const seguimientosOrdenados = [...(caso.seguimientos || [])].reverse();

  const filasHistorial = seguimientosOrdenados.map((seg) => {
    const fechaHoraTexto = seg.fechaHora
      ? formatearFechaHora(seg.fechaHora)
      : seg.fecha || '—';

    let tiempoDesdeApertura = '—';
    if (seg.fechaHora && caso.fechaHoraApertura) {
      const ms = calcularDuracion(caso.fechaHoraApertura, seg.fechaHora);
      tiempoDesdeApertura = ms >= 0 ? formatearDuracion(ms) : '0 min';
    }

    return [
      fechaHoraTexto,
      (seg.autor || '').toUpperCase(),
      (seg.nota || '').toUpperCase(),
      tiempoDesdeApertura,
    ];
  });

  autoTable(doc, {
    startY: posY,
    head: [columnasHistorial],
    body: filasHistorial,
    theme: 'striped',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [42, 140, 75], textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: {
      0: { cellWidth: 32 },
      1: { cellWidth: 38 },
      2: { cellWidth: 84 },
      3: { cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
  });

  // 6. Pie con numeración de páginas
  const totalPaginas = doc.getNumberOfPages();
  for (let i = 1; i <= totalPaginas; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);
    doc.text(
      `CASOOK · Reporte del caso ${caso.codigo} · Página ${i} de ${totalPaginas}`,
      14,
      287
    );
  }

  const fechaArchivo = new Date().toISOString().slice(0, 10);
  doc.save(`CasoOK_${caso.codigo}_${fechaArchivo}.pdf`);
}
