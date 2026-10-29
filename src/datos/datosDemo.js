// =========================================================
// Datos iniciales de demostración - CasoOK
// Estados: en_proceso | por_confirmar | cerrado
// Categorías: 10 categorías oficiales
// Fechas: formato ISO con fecha y hora
// =========================================================
import { sumarDias } from '../utilidades/fechas';
import { lotesGrandesCatalogo } from './lotesEcuador';

export const usuariosDemoIniciales = [
  {
    id: 1,
    cedula: '1710034065', // Válida Módulo 10
    nombre: 'EDWIN',
    apellido: 'CUSIN',
    password: '1710034065',
    rol: 'superusuario',
    estado: true,
  },
  {
    id: 2,
    cedula: '1715632848', // Válida Módulo 10
    nombre: 'BLANCA',
    apellido: 'LINCANGO',
    password: '1715632848',
    rol: 'operador_administracion',
    estado: true,
  },
  {
    id: 3,
    cedula: '1722839451', // Válida Módulo 10
    nombre: 'LUIS',
    apellido: 'TITO',
    password: '1722839451',
    rol: 'operador_seguridad',
    estado: true,
  },
  {
    id: 4,
    cedula: '1713562914', // Válida Módulo 10
    nombre: 'RAMIRO',
    apellido: 'ESTRADA',
    password: '1713562914',
    rol: 'mantenimiento',
    estado: true,
  },
];

export const etiquetasRol = {
  superusuario: 'SUPERUSUARIO',
  operador_administracion: 'OPERADOR ADMINISTRACIÓN',
  operador_seguridad: 'OPERADOR SEGURIDAD',
  mantenimiento: 'MANTENIMIENTO',
};

// Estados del caso (el estado "abierto" fue eliminado en Fase 1)
export const estados = {
  en_proceso: { nombre: 'EN PROCESO', color: 'var(--color-info)' },
  por_confirmar: { nombre: 'POR CONFIRMAR', color: 'var(--color-advertencia)' },
  cerrado: { nombre: 'CERRADO', color: 'var(--color-resuelto)' },
};

// Plazos configurables por prioridad
export const prioridadesIniciales = [
  { id: 'URGENTE', nombre: 'URGENTE', plazoDias: 1, color: 'var(--color-alerta)' },
  { id: 'ALTA', nombre: 'ALTA', plazoDias: 3, color: 'var(--color-advertencia)' },
  { id: 'MEDIA', nombre: 'MEDIA', plazoDias: 5, color: 'var(--color-info)' },
  { id: 'BAJA', nombre: 'BAJA', plazoDias: 5, color: 'var(--color-secundario)' },
];

export const etapasIniciales = [
  { id: 1, nombre: 'ETAPA 1', estado: true },
  { id: 2, nombre: 'ETAPA 2', estado: true },
  { id: 3, nombre: 'ETAPA 3', estado: true },
];

// Generar calles de la A a la Z más los ejemplos solicitados
function generarCallesIniciales() {
  const lista = [];
  let id = 1;

  // Letras A a Z
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  letras.forEach((letra) => {
    lista.push({
      id: id++,
      nombre: `CALLE ${letra}`,
      estado: true,
    });
  });

  // Ejemplos adicionales especificados
  lista.push({ id: id++, nombre: 'PASAJE 1', estado: true });
  lista.push({ id: id++, nombre: 'PASAJE 3', estado: true });
  lista.push({ id: id++, nombre: 'AV. COCO', estado: true });

  return lista;
}

export const callesIniciales = generarCallesIniciales();

export const lotesIniciales = lotesGrandesCatalogo;

export const areasIniciales = [
  { id: 1, nombre: 'ADMINISTRACIÓN', estado: true },
  { id: 2, nombre: 'MANTENIMIENTO', estado: true },
  { id: 3, nombre: 'SEGURIDAD', estado: true },
];

// 10 Categorías oficiales con área inicial sugerida
export const categoriasIniciales = [
  {
  id: 1,
  codigo: '01',
  nombre: '01 · MANTENIMIENTO E INFRAESTRUCTURA',
  descripcion: 'Vías, aceras, parques, luminarias y redes propias.',
  areaSugerida: 'MANTENIMIENTO',
  estado: true,
},
{
  id: 2,
  codigo: '02',
  nombre: '02 · SEGURIDAD Y VIGILANCIA',
  descripcion: 'Incidentes, guardias, cámaras y control de accesos.',
  areaSugerida: 'SEGURIDAD',
  estado: true,
},
{
  id: 3,
  codigo: '03',
  nombre: '03 · ADMINISTRACIÓN Y TRÁMITES',
  descripcion: 'Oficios, documentos, quejas y gestiones institucionales.',
  areaSugerida: 'ADMINISTRACIÓN',
  estado: true,
},
{
  id: 4,
  codigo: '04',
  nombre: '04 · LIMPIEZA Y RESIDUOS',
  descripcion: 'Basura, escombros, sumideros y saneamiento.',
  areaSugerida: 'MANTENIMIENTO',
  estado: true,
},
{
  id: 5,
  codigo: '05',
  nombre: '05 · MASCOTAS Y CONTROL DE PLAGAS',
  descripcion: 'Tenencia responsable, animales extraviados y plagas.',
  areaSugerida: 'ADMINISTRACIÓN',
  estado: true,
},
{
  id: 6,
  codigo: '06',
  nombre: '06 · VIALIDAD Y SEÑALIZACIÓN',
  descripcion: 'Tránsito, señalización y evaluación de reductores.',
  areaSugerida: 'MANTENIMIENTO',
  estado: true,
},
{
  id: 7,
  codigo: '07',
  nombre: '07 · SERVICIOS BÁSICOS Y REDES',
  descripcion: 'Agua, alcantarillado, riego y otras instalaciones.',
  areaSugerida: 'MANTENIMIENTO',
  estado: true,
},
{
  id: 8,
  codigo: '08',
  nombre: '08 · ÁREAS COMUNALES Y CONVIVENCIA',
  descripcion: 'Canchas, parques, ruido y uso de instalaciones.',
  areaSugerida: 'ADMINISTRACIÓN',
  estado: true,
},
{
  id: 9,
  codigo: '09',
  nombre: '09 · OBRAS Y PROYECTOS',
  descripcion: 'Nuevas obras, mejoras y solicitudes de inversión.',
  areaSugerida: 'ADMINISTRACIÓN',
  estado: true,
},
{
  id: 10,
  codigo: '10',
  nombre: '10 · OTROS REQUERIMIENTOS',
  descripcion: 'Casos que no encajen en las categorías anteriores.',
  areaSugerida: 'ADMINISTRACIÓN',
  estado: true,
},
];

export const relacionesReportante = [
  { valor: 'PROPIETARIO', nombre: 'PROPIETARIO' },
  { valor: 'INQUILINO', nombre: 'INQUILINO' },
  { valor: 'VISITA', nombre: 'VISITA' },
  { valor: 'PERSONAL INTERNO', nombre: 'PERSONAL INTERNO' },
];

// Casos demo iniciales migrados sin el estado "abierto"
export const casosInicialesDemo = [
  {
    id: 1,
    codigo: 'REQ-001',
    fechaHoraApertura: `${sumarDias(-9)}T08:30:00Z`,
    fechaRecepcion: sumarDias(-9),
    fechaHoraCierre: null,
    registradoPor: 2, // Ana Paredes
    reportanteNombre: 'SANDRA PAZMIÑO',
    reportanteContacto: '0994286523',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: '505.1A',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: 'CALLE A',
    referenciaUbicacion: 'PARQUE FRENTE A LA EMBAJADA',
    categoria: '07 · Servicios básicos y redes',
    area: 'MANTENIMIENTO',
    prioridad: 'MEDIA',
    descripcion: 'EL PARQUE ESTÁ LLENO DE RAMAS Y HOJAS, Y LOS ASPERSORES NO FUNCIONAN ADECUADAMENTE.',
    fotoInicial: 'parque_danos_inicial.jpg',
    fotoFinal: null,
    pdfInicial: null,
    estado: 'en_proceso',
    proximoSeguimiento: sumarDias(-3),
    seguimientos: [
      {
        id: 1,
        fechaHora: `${sumarDias(-9)}T08:35:00Z`,
        fecha: sumarDias(-9),
        autor: 'ANA PAREDES',
        tipo: 'apertura',
        nota: 'REPORTE RECIBIDO Y PUESTO EN PROCESO INMEDIATAMENTE.',
      },
    ],
  },
  {
    id: 2,
    codigo: 'REQ-002',
    fechaHoraApertura: `${sumarDias(-2)}T19:40:00Z`,
    fechaRecepcion: sumarDias(-2),
    fechaHoraCierre: null,
    registradoPor: 2, // Ana Paredes
    reportanteNombre: 'JUAN MOSQUERA',
    reportanteContacto: '0995829961',
    reportanteTipo: 'INQUILINO',
    reportanteLote: '866.0',
    etapa: 'ETAPA 3',
    callePrimaria: 'CALLE T',
    calleSecundaria: 'CALLE B',
    referenciaUbicacion: 'CERCA DE LA GARITA POSTERIOR',
    categoria: '01 · Mantenimiento e infraestructura',
    area: 'MANTENIMIENTO',
    prioridad: 'ALTA',
    descripcion: 'POSTE DE ALUMBRADO PÚBLICO APAGADO DESDE HACE VARIAS NOCHES.',
    fotoInicial: 'poste_luz_danado.jpg',
    fotoFinal: null,
    pdfInicial: 'oficio_empresa_electrica.pdf',
    estado: 'en_proceso', // Migrado de abierto a en_proceso
    proximoSeguimiento: sumarDias(1),
    seguimientos: [
      {
        id: 1,
        fechaHora: `${sumarDias(-2)}T19:42:00Z`,
        fecha: sumarDias(-2),
        autor: 'ANA PAREDES',
        tipo: 'apertura',
        nota: 'REPORTE INICIAL REGISTRADO DIRECTAMENTE EN PROCESO.',
      },
    ],
  },
  {
    id: 3,
    codigo: 'REQ-003',
    fechaHoraApertura: `${sumarDias(-4)}T11:15:00Z`,
    fechaRecepcion: sumarDias(-4),
    fechaHoraCierre: null,
    registradoPor: 3, // Luis Guerrero
    reportanteNombre: 'CENTRO DE CONTROL',
    reportanteContacto: '022498700',
    reportanteTipo: 'PERSONAL INTERNO',
    reportanteLote: '101.1',
    etapa: 'ETAPA 1',
    callePrimaria: 'CALLE A',
    calleSecundaria: 'PASAJE 1',
    referenciaUbicacion: 'REDONDEL FRENTE A LA IGLESIA PRINCIPAL',
    categoria: '05 · Mascotas y control de plagas',
    area: 'MANTENIMIENTO',
    prioridad: 'URGENTE',
    descripcion: 'SE OBSERVA UN PANAL DE AVISPAS EN EL REDONDEL CON RIESGO PARA TRANSEÚNTES.',
    fotoInicial: 'panal_avispas_arbol.jpg',
    fotoFinal: 'panal_retirado_controlado.jpg',
    pdfInicial: null,
    estado: 'por_confirmar',
    proximoSeguimiento: sumarDias(-1),
    seguimientos: [
      {
        id: 1,
        fechaHora: `${sumarDias(-4)}T11:20:00Z`,
        fecha: sumarDias(-4),
        autor: 'LUIS GUERRERO',
        tipo: 'apertura',
        nota: 'AVISO DE EMERGENCIA DERIVADO A MANTENIMIENTO.',
      },
      {
        id: 2,
        fechaHora: `${sumarDias(-1)}T16:00:00Z`,
        fecha: sumarDias(-1),
        autor: 'JORGE ESTRADA',
        tipo: 'atendido',
        nota: 'PANAL RETIRADO POR PERSONAL CAPACITADO CON EQUIPO DE PROTECCIÓN.',
        foto: 'panal_retirado_controlado.jpg',
      },
    ],
  },
  {
    id: 4,
    codigo: 'REQ-004',
    fechaHoraApertura: `${sumarDias(-1)}T15:00:00Z`,
    fechaRecepcion: sumarDias(-1),
    fechaHoraCierre: null,
    registradoPor: 3, // Luis Guerrero
    reportanteNombre: 'PAULINA RUALES',
    reportanteContacto: '0992502313',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: '507.0',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: '',
    referenciaUbicacion: 'ZONA DE PASEO DE MASCOTAS',
    categoria: '05 · Mascotas y control de plagas',
    area: 'SEGURIDAD',
    prioridad: 'BAJA',
    descripcion: 'PASEO DE PERROS SIN CORREA GENERA CONFLICTOS ENTRE RESIDENTES EN LA TARDE.',
    fotoInicial: null,
    fotoFinal: null,
    pdfInicial: null,
    estado: 'en_proceso', // Migrado de abierto a en_proceso
    proximoSeguimiento: sumarDias(4),
    seguimientos: [
      {
        id: 1,
        fechaHora: `${sumarDias(-1)}T15:05:00Z`,
        fecha: sumarDias(-1),
        autor: 'LUIS GUERRERO',
        tipo: 'apertura',
        nota: 'NOVEDAD ASIGNADA A PATRULLA DE SEGURIDAD.',
      },
    ],
  },
  {
    id: 5,
    codigo: 'REQ-005',
    fechaHoraApertura: `${sumarDias(-12)}T09:00:00Z`,
    fechaRecepcion: sumarDias(-12),
    fechaHoraCierre: `${sumarDias(-8)}T14:30:00Z`, // 3 días y 5.5 horas de resolución
    registradoPor: 1, // Carlos Mendoza
    reportanteNombre: 'MÓNICA LANDÁZURI',
    reportanteContacto: '0998730141',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: '508.6',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: 'CALLE T',
    referenciaUbicacion: 'ACERA EXTERIOR',
    categoria: '07 · Servicios básicos y redes',
    area: 'MANTENIMIENTO',
    prioridad: 'MEDIA',
    descripcion: 'SOLICITA PODA DE ÁRBOLES DE GRAN ALTURA EN LA CALLE M QUE OBSTRUYEN CABLES.',
    fotoInicial: 'arboles_obstruccion.jpg',
    fotoFinal: 'arboles_podados_despejado.jpg',
    pdfInicial: null,
    estado: 'cerrado',
    proximoSeguimiento: sumarDias(-8),
    seguimientos: [
      {
        id: 1,
        fechaHora: `${sumarDias(-12)}T09:10:00Z`,
        fecha: sumarDias(-12),
        autor: 'CARLOS MENDOZA',
        tipo: 'apertura',
        nota: 'INSPECCIÓN INICIAL DE RAMAS CERCA DEL TENDIDO ELÉCTRICO.',
      },
      {
        id: 2,
        fechaHora: `${sumarDias(-9)}T11:00:00Z`,
        fecha: sumarDias(-9),
        autor: 'JORGE ESTRADA',
        tipo: 'atendido',
        nota: 'PODA EJECUTADA SATISFACTORIAMENTE.',
        foto: 'arboles_podados_despejado.jpg',
      },
      {
        id: 3,
        fechaHora: `${sumarDias(-8)}T14:30:00Z`,
        fecha: sumarDias(-8),
        autor: 'ANA PAREDES',
        tipo: 'confirmacion',
        nota: 'SOLUCIÓN CONFIRMADA CON LA RESIDENTE.',
      },
    ],
  },
];

export const notificacionesDemoIniciales = [
  {
    id: 1,
    idCaso: 1,
    tipo: 'SEGUIMIENTO VENCIDO',
    mensaje: 'REQ-001 LLEVA DÍAS DE ATRASO EN SEGUIMIENTO.',
    fecha: sumarDias(0),
    leida: false,
  },
  {
    id: 2,
    idCaso: 3,
    tipo: 'CASO ATENDIDO',
    mensaje: 'REQ-003 FUE MARCADO COMO ATENDIDO: ESPERA CONFIRMACIÓN.',
    fecha: sumarDias(-1),
    leida: false,
  },
  {
    id: 3,
    idCaso: 4,
    tipo: 'SOLICITUD NUEVA',
    mensaje: 'NUEVA SOLICITUD REQ-004 EN PROCESO: PASEO DE MASCOTAS.',
    fecha: sumarDias(-1),
    leida: false,
  },
];
