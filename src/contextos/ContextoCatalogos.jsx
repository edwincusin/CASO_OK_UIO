import { createContext, useContext, useState } from 'react';
import {
  etapasIniciales,
  callesIniciales,
  lotesIniciales,
  areasIniciales,
  categoriasIniciales,
} from '../datos/datosDemo';
import { aMayusculas } from '../utilidades/texto';
import { validarFormatoLote, ordenarLotesNatural } from '../datos/lotesEcuador';

/**
 * ContextoCatalogos
 * Gestión centralizada de catálogos independientes (Etapas, Calles, Lotes, Áreas, Categorías).
 * Lotes y etapas son totalmente independientes.
 * Incluye borrado lógico e inserción masiva de lotes por lote.
 */

const ContextoCatalogos = createContext(null);

// Expresión para validación de nombres de calles (letras, números, espacios, puntos y acentos)
const REGEX_CALLE = /^[A-Z0-9ÁÉÍÓÚÑ\s\.]+$/;

export function ProveedorCatalogos({ children }) {
  const [etapas, setEtapas] = useState(etapasIniciales);
  const [calles, setCalles] = useState(callesIniciales);
  const [lotes, setLotes] = useState(() => ordenarLotesNatural(lotesIniciales));
  const [areas, setAreas] = useState(areasIniciales);
  const [categorias, setCategorias] = useState(categoriasIniciales);

  // Helper para validar item antes de crear
  function validarNombreItem(catalogoTipo, nombreMayus) {
    if (!nombreMayus) {
      return { valido: false, mensaje: 'EL NOMBRE ES OBLIGATORIO' };
    }

    if (catalogoTipo === 'lotes') {
      if (!validarFormatoLote(nombreMayus)) {
        return {
          valido: false,
          mensaje: 'FORMATO INVÁLIDO. DEBE SER NUMERO.SUBLOTE (EJ: 12.3, 520.0, 189.CASA1)',
        };
      }
    }

    if (catalogoTipo === 'calles') {
      if (!REGEX_CALLE.test(nombreMayus)) {
        return {
          valido: false,
          mensaje: 'LA CALLE SOLO PUEDE CONTENER LETRAS, NÚMEROS, ESPACIOS Y PUNTOS',
        };
      }
    }

    return { valido: true };
  }

  // Helper para agregar item individual
  function crearItem(catalogoTipo, nombre) {
    const nombreMayus = aMayusculas(nombre).trim();
    const validacion = validarNombreItem(catalogoTipo, nombreMayus);
    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.mensaje };
    }

    let lista;
    let setLista;
    if (catalogoTipo === 'etapas') {
      lista = etapas;
      setLista = setEtapas;
    } else if (catalogoTipo === 'calles') {
      lista = calles;
      setLista = setCalles;
    } else if (catalogoTipo === 'lotes') {
      lista = lotes;
      setLista = setLotes;
    } else if (catalogoTipo === 'areas') {
      lista = areas;
      setLista = setAreas;
    } else {
      lista = categorias;
      setLista = setCategorias;
    }

    if (lista.some((item) => item.nombre === nombreMayus)) {
      return { exito: false, mensaje: 'ESTE REGISTRO YA EXISTE EN EL CATÁLOGO' };
    }

    const nuevoId = lista.length > 0 ? Math.max(...lista.map((i) => i.id)) + 1 : 1;
    const nuevo = { id: nuevoId, nombre: nombreMayus, estado: true };

    if (catalogoTipo === 'lotes') {
      setLista(ordenarLotesNatural([...lista, nuevo]));
    } else {
      setLista([...lista, nuevo]);
    }

    return { exito: true, mensaje: 'REGISTRO CREADO CON ÉXITO', item: nuevo };
  }

  // Inserción masiva de lotes (uno por línea)
  function agregarVariosLotes(textoMultilinea) {
    if (!textoMultilinea || !textoMultilinea.trim()) {
      return { exito: false, mensaje: 'POR FAVOR INGRESE AL MENOS UN LOTE' };
    }

    const lineas = textoMultilinea
      .split(/\r?\n/)
      .map((l) => aMayusculas(l).trim())
      .filter((l) => l.length > 0);

    if (lineas.length === 0) {
      return { exito: false, mensaje: 'NO SE ENCONTRARON LÍNEAS VÁLIDAS' };
    }

    const existentesSet = new Set(lotes.map((l) => l.nombre));
    const procesadosEnLote = new Set();
    const nuevosObjetos = [];
    const invalidos = [];
    const duplicados = [];

    let proximoId = lotes.length > 0 ? Math.max(...lotes.map((i) => i.id)) + 1 : 1;

    for (const linea of lineas) {
      if (!validarFormatoLote(linea)) {
        invalidos.push(linea);
        continue;
      }
      if (existentesSet.has(linea) || procesadosEnLote.has(linea)) {
        duplicados.push(linea);
        continue;
      }
      procesadosEnLote.add(linea);
      nuevosObjetos.push({
        id: proximoId++,
        nombre: linea,
        estado: true,
      });
    }

    if (nuevosObjetos.length > 0) {
      setLotes(ordenarLotesNatural([...lotes, ...nuevosObjetos]));
    }

    return {
      exito: nuevosObjetos.length > 0,
      agregados: nuevosObjetos.length,
      invalidos,
      duplicados,
      totalProcesados: lineas.length,
    };
  }

  function actualizarItem(catalogoTipo, id, nuevoNombre) {
    const nombreMayus = aMayusculas(nuevoNombre).trim();
    const validacion = validarNombreItem(catalogoTipo, nombreMayus);
    if (!validacion.valido) {
      return { exito: false, mensaje: validacion.mensaje };
    }

    const updater = (lista) =>
      lista.map((item) => (item.id === id ? { ...item, nombre: nombreMayus } : item));

    if (catalogoTipo === 'etapas') setEtapas(updater);
    else if (catalogoTipo === 'calles') setCalles(updater);
    else if (catalogoTipo === 'lotes') setLotes((prev) => ordenarLotesNatural(updater(prev)));
    else if (catalogoTipo === 'areas') setAreas(updater);
    else setCategorias(updater);

    return { exito: true, mensaje: 'REGISTRO ACTUALIZADO' };
  }

  function toggleEstadoItem(catalogoTipo, id) {
    const updater = (lista) =>
      lista.map((item) => (item.id === id ? { ...item, estado: !item.estado } : item));

    if (catalogoTipo === 'etapas') setEtapas(updater);
    else if (catalogoTipo === 'calles') setCalles(updater);
    else if (catalogoTipo === 'lotes') setLotes(updater);
    else if (catalogoTipo === 'areas') setAreas(updater);
    else setCategorias(updater);
  }

  function eliminarItem(catalogoTipo, id, casos = []) {
    let lista;
    let setLista;
    let campoVerificacion;

    if (catalogoTipo === 'etapas') {
      lista = etapas;
      setLista = setEtapas;
      campoVerificacion = 'etapa';
    } else if (catalogoTipo === 'calles') {
      lista = calles;
      setLista = setCalles;
      campoVerificacion = 'calle';
    } else if (catalogoTipo === 'lotes') {
      lista = lotes;
      setLista = setLotes;
      campoVerificacion = 'lote';
    } else if (catalogoTipo === 'areas') {
      lista = areas;
      setLista = setAreas;
      campoVerificacion = 'area';
    } else {
      lista = categorias;
      setLista = setCategorias;
      campoVerificacion = 'categoria';
    }

    const item = lista.find((i) => i.id === id);
    if (!item) return { exito: false, mensaje: 'REGISTRO NO ENCONTRADO' };

    // Verificar relaciones con novedades históricas
    let tieneRelaciones = false;
    if (campoVerificacion === 'etapa') {
      tieneRelaciones = casos.some((c) => aMayusculas(c.etapa) === aMayusculas(item.nombre));
    } else if (campoVerificacion === 'calle') {
      tieneRelaciones = casos.some(
        (c) =>
          aMayusculas(c.callePrimaria) === aMayusculas(item.nombre) ||
          aMayusculas(c.calleSecundaria) === aMayusculas(item.nombre) ||
          aMayusculas(c.calle) === aMayusculas(item.nombre)
      );
    } else if (campoVerificacion === 'lote') {
      tieneRelaciones = casos.some(
        (c) =>
          aMayusculas(c.reportanteLote) === aMayusculas(item.nombre) ||
          aMayusculas(c.lote) === aMayusculas(item.nombre)
      );
    } else if (campoVerificacion === 'area') {
      tieneRelaciones = casos.some((c) => aMayusculas(c.area) === aMayusculas(item.nombre));
    } else if (campoVerificacion === 'categoria') {
      tieneRelaciones = casos.some((c) => aMayusculas(c.categoria) === aMayusculas(item.nombre));
    }

    if (tieneRelaciones) {
      // Borrado Lógico
      setLista(lista.map((i) => (i.id === id ? { ...i, estado: false } : i)));
      return {
        exito: true,
        tipo: 'logico',
        mensaje: 'REGISTRO EN USO: SE APLICÓ BORRADO LÓGICO (DESHABILITADO)',
      };
    } else {
      // Borrado Físico
      setLista(lista.filter((i) => i.id !== id));
      return {
        exito: true,
        tipo: 'fisico',
        mensaje: 'REGISTRO SIN VÍNCULOS: ELIMINADO FÍSICAMENTE',
      };
    }
  }

  const valor = {
    etapas,
    calles,
    lotes,
    areas,
    categorias,
    crearItem,
    agregarVariosLotes,
    actualizarItem,
    toggleEstadoItem,
    eliminarItem,
  };

  return <ContextoCatalogos.Provider value={valor}>{children}</ContextoCatalogos.Provider>;
}

export const useCatalogos = () =>
  useContext(ContextoCatalogos) || {
    etapas: [],
    calles: [],
    lotes: [],
    areas: [],
    categorias: [],
    crearItem: () => {},
    agregarVariosLotes: () => {},
    actualizarItem: () => {},
    toggleEstadoItem: () => {},
    eliminarItem: () => {},
  };
