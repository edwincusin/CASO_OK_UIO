import { createContext, useContext, useState, useMemo } from 'react';
import { casosInicialesDemo, prioridadesIniciales } from '../datos/datosDemo';
import { hoy, sumarDias, diasDeAtraso } from '../utilidades/fechas';
import { aMayusculas } from '../utilidades/texto';
import { useSesion } from './ContextoSesion';

const ContextoCasos = createContext(null);

export function ProveedorCasos({ children }) {
  const [casos, setCasos] = useState(casosInicialesDemo);
  const [prioridades, setPrioridades] = useState(prioridadesIniciales);
  const { usuario } = useSesion();

  function buscarPrioridad(idPrioridad) {
    const normalizado = aMayusculas(idPrioridad);
    return (
      prioridades.find((p) => p.id === normalizado || p.nombre === normalizado) || {
        id: normalizado || 'MEDIA',
        nombre: normalizado || 'MEDIA',
        plazoDias: 3,
        color: 'var(--color-info)',
      }
    );
  }

  // Filtrado estricto por rol v4.0 que garantiza que MANTENIMIENTO vea exclusivamente sus casos
  const casosVisibles = useMemo(() => {
    if (!usuario) return [];

    if (usuario.rol === 'superusuario' || usuario.rol === 'operador_administracion') {
      return casos;
    }

    if (usuario.rol === 'operador_seguridad') {
      return casos; // Visualización global para Seguridad
    }

    if (usuario.rol === 'mantenimiento') {
      return casos.filter(
        (c) => String(c.area).trim().toUpperCase() === 'MANTENIMIENTO'
      );
    }

    return [];
  }, [casos, usuario]);

  // Crear caso V4
  function crearCaso(datosFormulario, autorUsuario) {
    const nuevoId = casos.length > 0 ? Math.max(...casos.map((c) => Number(c.id) || 0)) + 1 : 1;
    const prioridadObj = buscarPrioridad(datosFormulario.prioridad);
    const plazoDias = prioridadObj?.plazoDias ?? 3;

    const nuevoCaso = {
      id: nuevoId,
      codigo: `REQ-${String(nuevoId).padStart(3, '0')}`,
      fechaRecepcion: hoy(),
      registradoPor: autorUsuario?.id || 1,
      reportanteNombre: aMayusculas(datosFormulario.reportanteNombre),
      reportanteTipo: datosFormulario.reportanteTipo || 'PROPIETARIO',
      reportanteLote: aMayusculas(datosFormulario.reportanteLote),
      reportanteContacto: datosFormulario.reportanteContacto || '',
      etapa: aMayusculas(datosFormulario.etapa),
      callePrimaria: aMayusculas(datosFormulario.callePrimaria),
      calleSecundaria: aMayusculas(datosFormulario.calleSecundaria || ''),
      referenciaUbicacion: aMayusculas(datosFormulario.referenciaUbicacion || ''),
      ubicacionTexto: aMayusculas(datosFormulario.referenciaUbicacion || ''),
      categoria: aMayusculas(datosFormulario.categoria),
      area: aMayusculas(datosFormulario.area),
      prioridad: aMayusculas(datosFormulario.prioridad || 'MEDIA'),
      descripcion: aMayusculas(datosFormulario.descripcion),
      fotoInicial: datosFormulario.fotoInicial || null,
      fotoFinal: null,
      pdfInicial: datosFormulario.pdfInicial || null,
      estado: 'abierto',
      proximoSeguimiento: sumarDias(plazoDias),
      seguimientos: [
        {
          id: 1,
          fecha: hoy(),
          autor: `${autorUsuario?.nombre || ''} ${autorUsuario?.apellido || ''}`.trim() || 'USUARIO',
          tipo: 'apertura',
          nota: 'REPORTE INICIAL REGISTRADO EN QUINDE CONTROL.',
          foto: datosFormulario.fotoInicial || null,
        },
      ],
    };

    setCasos((actuales) => [nuevoCaso, ...actuales]);
    return nuevoCaso;
  }

  // Edición restringida
  function actualizarCaso(idCaso, datosModificados, autorUsuario) {
    const caso = casos.find((c) => c.id === idCaso);
    if (!caso) return { exito: false, mensaje: 'CASO NO ENCONTRADO' };
    if (caso.estado !== 'abierto') {
      return { exito: false, mensaje: 'SOLO SE PUEDEN EDITAR CASOS EN ESTADO ABIERTO' };
    }
    if (caso.registradoPor !== autorUsuario?.id && autorUsuario?.rol !== 'superusuario') {
      return { exito: false, mensaje: 'SOLO EL USUARIO QUE CREÓ EL CASO PUEDE MODIFICARLO' };
    }

    setCasos((actuales) =>
      actuales.map((c) => {
        if (c.id !== idCaso) return c;
        return {
          ...c,
          reportanteNombre: aMayusculas(datosModificados.reportanteNombre ?? c.reportanteNombre),
          reportanteTipo: datosModificados.reportanteTipo ?? c.reportanteTipo,
          reportanteLote: aMayusculas(datosModificados.reportanteLote ?? c.reportanteLote),
          reportanteContacto: datosModificados.reportanteContacto ?? c.reportanteContacto,
          etapa: aMayusculas(datosModificados.etapa ?? c.etapa),
          callePrimaria: aMayusculas(datosModificados.callePrimaria ?? c.callePrimaria),
          calleSecundaria: aMayusculas(datosModificados.calleSecundaria ?? c.calleSecundaria),
          referenciaUbicacion: aMayusculas(datosModificados.referenciaUbicacion ?? c.referenciaUbicacion),
          categoria: aMayusculas(datosModificados.categoria ?? c.categoria),
          area: aMayusculas(datosModificados.area ?? c.area),
          prioridad: aMayusculas(datosModificados.prioridad ?? c.prioridad),
          descripcion: aMayusculas(datosModificados.descripcion ?? c.descripcion),
          fotoInicial: datosModificados.fotoInicial ?? c.fotoInicial,
        };
      })
    );
    return { exito: true, mensaje: 'CASO ACTUALIZADO CON ÉXITO' };
  }

  // Seguimiento
  function agregarSeguimiento(idCaso, autorUsuario, tipo, nota, nuevoEstado, fotoFinal = null) {
    setCasos((actuales) =>
      actuales.map((caso) => {
        if (caso.id !== idCaso) return caso;

        const estadoFinal = nuevoEstado || caso.estado;
        const prioridadObj = buscarPrioridad(caso.prioridad);
        const plazoDias = prioridadObj?.plazoDias ?? 3;
        const autorNombre = `${autorUsuario?.nombre || ''} ${autorUsuario?.apellido || ''}`.trim() || 'USUARIO';

        const nuevoSeguimiento = {
          id: caso.seguimientos.length + 1,
          fecha: hoy(),
          autor: autorNombre,
          tipo,
          nota: aMayusculas(nota),
          foto: fotoFinal,
        };

        return {
          ...caso,
          estado: estadoFinal,
          fotoFinal: fotoFinal || caso.fotoFinal,
          proximoSeguimiento: estadoFinal === 'cerrado' ? caso.proximoSeguimiento : sumarDias(plazoDias),
          seguimientos: [nuevoSeguimiento, ...caso.seguimientos],
        };
      })
    );
  }

  function cambiarPlazoPrioridad(idPrioridad, nuevoPlazo) {
    setPrioridades((actuales) =>
      actuales.map((prioridad) =>
        prioridad.id === idPrioridad ? { ...prioridad, plazoDias: nuevoPlazo } : prioridad
      )
    );
  }

  // Casos enriquecidos con propiedad de vencimiento
  const enriquecer = (lista) =>
    lista.map((c) => ({
      ...c,
      esVencido: c.estado !== 'cerrado' && diasDeAtraso(c.proximoSeguimiento) > 0,
      diasAtraso: diasDeAtraso(c.proximoSeguimiento),
    }));

  const valor = {
    casos: enriquecer(casosVisibles),
    todosLosCasos: enriquecer(casos),
    prioridades,
    buscarPrioridad,
    crearCaso,
    actualizarCaso,
    agregarSeguimiento,
    cambiarPlazoPrioridad,
  };

  return <ContextoCasos.Provider value={valor}>{children}</ContextoCasos.Provider>;
}

export const useCasos = () => useContext(ContextoCasos) || {};
