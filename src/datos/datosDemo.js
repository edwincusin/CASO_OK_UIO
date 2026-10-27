// =========================================================
// Datos iniciales de prueba (v4.0) - Quinde Control
// Urbanización El Condado
// =========================================================
import { sumarDias } from '../utilidades/fechas';
import { lotesGrandesCatalogo } from './lotesEcuador';

export const usuariosDemoIniciales = [
  {
    id: 1,
    cedula: '1710034065', // Válida Módulo 10
    nombre: 'CARLOS',
    apellido: 'MENDOZA',
    password: '1710034065',
    rol: 'superusuario',
    estado: true,
  },
  {
    id: 2,
    cedula: '1715632848', // Válida Módulo 10
    nombre: 'ANA',
    apellido: 'PAREDES',
    password: '1715632848',
    rol: 'operador_administracion',
    estado: true,
  },
  {
    id: 3,
    cedula: '1722839451', // Válida Módulo 10
    nombre: 'LUIS',
    apellido: 'GUERRERO',
    password: '1722839451',
    rol: 'operador_seguridad',
    estado: true,
  },
  {
    id: 4,
    cedula: '1713562914', // Válida Módulo 10
    nombre: 'JORGE',
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

// Estados oficiales
export const estados = {
  abierto: { nombre: 'ABIERTO', color: 'var(--color-texto-suave)' },
  en_proceso: { nombre: 'EN PROCESO', color: 'var(--color-info)' },
  por_confirmar: { nombre: 'POR CONFIRMAR', color: 'var(--color-advertencia)' },
  cerrado: { nombre: 'CERRADO', color: 'var(--color-resuelto)' },
};

// Plazos configurables
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

export const callesIniciales = [
  { id: 1, nombre: 'CALLE A', estado: true },
  { id: 2, nombre: 'CALLE M', estado: true },
  { id: 3, nombre: 'CALLE T', estado: true },
  { id: 4, nombre: 'AVENIDA LOS CÓNDORES', estado: true },
  { id: 5, nombre: 'CALLE DE LOS ARRAYANES', estado: true },
  { id: 6, nombre: 'CALLE DEL PARQUE', estado: true },
];

export const lotesIniciales = lotesGrandesCatalogo;

export const areasIniciales = [
  { id: 1, nombre: 'ADMINISTRACIÓN', estado: true },
  { id: 2, nombre: 'MANTENIMIENTO', estado: true },
  { id: 3, nombre: 'SEGURIDAD', estado: true },
];

export const categoriasIniciales = [
  { id: 1, nombre: 'ALUMBRADO PÚBLICO', estado: true },
  { id: 2, nombre: 'FUGA DE AGUA', estado: true },
  { id: 3, nombre: 'VÍAS Y SEÑALIZACIÓN', estado: true },
  { id: 4, nombre: 'ÁREAS VERDES Y RIEGO', estado: true },
  { id: 5, nombre: 'LIMPIEZA Y BASURA', estado: true },
  { id: 6, nombre: 'MASCOTAS', estado: true },
  { id: 7, nombre: 'PLAGAS', estado: true },
  { id: 8, nombre: 'SEGURIDAD Y CONVIVENCIA', estado: true },
  { id: 9, nombre: 'OTROS', estado: true },
];

export const relacionesReportante = [
  { valor: 'PROPIETARIO', nombre: 'PROPIETARIO' },
  { valor: 'INQUILINO', nombre: 'INQUILINO' },
  { valor: 'VISITA', nombre: 'VISITA' },
  { valor: 'PERSONAL INTERNO', nombre: 'PERSONAL INTERNO' },
];

export const casosInicialesDemo = [
  {
    id: 1,
    codigo: 'REQ-001',
    fechaRecepcion: sumarDias(-9),
    registradoPor: 2, // Ana Paredes
    reportanteNombre: 'SANDRA PAZMIÑO',
    reportanteContacto: '0994286523',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: 'LOTE 505.1A',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: 'CALLE DEL PARQUE',
    referenciaUbicacion: 'PARQUE FRENTE A LA EMBAJADA',
    categoria: 'ÁREAS VERDES Y RIEGO',
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
        fecha: sumarDias(-9),
        autor: 'ANA PAREDES',
        tipo: 'apertura',
        nota: 'REPORTE RECIBIDO POR MESA DE AYUDA.',
      },
    ],
  },
  {
    id: 2,
    codigo: 'REQ-002',
    fechaRecepcion: sumarDias(-2),
    registradoPor: 2, // Ana Paredes
    reportanteNombre: 'JUAN MOSQUERA',
    reportanteContacto: '0995829961',
    reportanteTipo: 'INQUILINO',
    reportanteLote: 'LOTE 866',
    etapa: 'ETAPA 3',
    callePrimaria: 'CALLE T',
    calleSecundaria: 'AVENIDA LOS CÓNDORES',
    referenciaUbicacion: 'CERCA DE LA GARITA POSTERIOR',
    categoria: 'ALUMBRADO PÚBLICO',
    area: 'ADMINISTRACIÓN',
    prioridad: 'ALTA',
    descripcion: 'POSTE DE ALUMBRADO PÚBLICO APAGADO DESDE HACE VARIAS NOCHES.',
    fotoInicial: 'poste_luz_danado.jpg',
    fotoFinal: null,
    pdfInicial: 'oficio_empresa_electrica.pdf',
    estado: 'abierto',
    proximoSeguimiento: sumarDias(1),
    seguimientos: [],
  },
  {
    id: 3,
    codigo: 'REQ-003',
    fechaRecepcion: sumarDias(-4),
    registradoPor: 3, // Luis Guerrero
    reportanteNombre: 'CENTRO DE CONTROL',
    reportanteContacto: '022498700',
    reportanteTipo: 'PERSONAL INTERNO',
    reportanteLote: 'LOTE 101',
    etapa: 'ETAPA 1',
    callePrimaria: 'CALLE A',
    calleSecundaria: 'CALLE DE LOS ARRAYANES',
    referenciaUbicacion: 'REDONDEL FRENTE A LA IGLESIA PRINCIPAL',
    categoria: 'PLAGAS',
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
    fechaRecepcion: sumarDias(-1),
    registradoPor: 3, // Luis Guerrero
    reportanteNombre: 'PAULINA RUALES',
    reportanteContacto: '0992502313',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: 'LOTE 507',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: '',
    referenciaUbicacion: 'ZONA DE PASEO DE MASCOTAS',
    categoria: 'MASCOTAS',
    area: 'SEGURIDAD',
    prioridad: 'BAJA',
    descripcion: 'PASEO DE PERROS SIN CORREA GENERA CONFLICTOS ENTRE RESIDENTES EN LA TARDE.',
    fotoInicial: null,
    fotoFinal: null,
    pdfInicial: null,
    estado: 'abierto',
    proximoSeguimiento: sumarDias(4),
    seguimientos: [],
  },
  {
    id: 5,
    codigo: 'REQ-005',
    fechaRecepcion: sumarDias(-12),
    registradoPor: 1, // Carlos Mendoza
    reportanteNombre: 'MÓNICA LANDÁZURI',
    reportanteContacto: '0998730141',
    reportanteTipo: 'PROPIETARIO',
    reportanteLote: 'LOTE 508.6',
    etapa: 'ETAPA 2',
    callePrimaria: 'CALLE M',
    calleSecundaria: 'CALLE T',
    referenciaUbicacion: 'ACERA EXTERIOR',
    categoria: 'ÁREAS VERDES Y RIEGO',
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
        fecha: sumarDias(-9),
        autor: 'JORGE ESTRADA',
        tipo: 'atendido',
        nota: 'PODA EJECUTADA SATISFACTORIAMENTE.',
        foto: 'arboles_podados_despejado.jpg',
      },
      {
        id: 2,
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
    mensaje: 'REQ-001 LLEVA 3 DÍAS DE ATRASO EN SEGUIMIENTO.',
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
    mensaje: 'NUEVA SOLICITUD REQ-004: PASEO DE MASCOTAS.',
    fecha: sumarDias(-1),
    leida: false,
  },
];
