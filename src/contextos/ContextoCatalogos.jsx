import { createContext, useContext, useState } from 'react';
import {
  etapasIniciales,
  callesIniciales,
  lotesIniciales,
  areasIniciales,
  categoriasIniciales,
} from '../datos/datosDemo';
import { aMayusculas } from '../utilidades/texto';

const ContextoCatalogos = createContext(null);

export function ProveedorCatalogos({ children }) {
  const [etapas, setEtapas] = useState(etapasIniciales);
  const [calles, setCalles] = useState(callesIniciales);
  const [lotes, setLotes] = useState(lotesIniciales);
  const [areas, setAreas] = useState(areasIniciales);
  const [categorias, setCategorias] = useState(categoriasIniciales);

  // Helper generador para agregar item
  function crearItem(catalogoTipo, nombre) {
    const nombreMayus = aMayusculas(nombre).trim();
    if (!nombreMayus) return { exito: false, mensaje: 'EL NOMBRE ES OBLIGATORIO' };

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
    setLista([...lista, nuevo]);
    return { exito: true, mensaje: 'REGISTRO CREADO CON ÉXITO', item: nuevo };
  }

  function actualizarItem(catalogoTipo, id, nuevoNombre) {
    const nombreMayus = aMayusculas(nuevoNombre).trim();
    if (!nombreMayus) return { exito: false, mensaje: 'EL NOMBRE ES OBLIGATORIO' };

    const updater = (lista) =>
      lista.map((item) => (item.id === id ? { ...item, nombre: nombreMayus } : item));

    if (catalogoTipo === 'etapas') setEtapas(updater);
    else if (catalogoTipo === 'calles') setCalles(updater);
    else if (catalogoTipo === 'lotes') setLotes(updater);
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

    // Verificar relaciones
    let tieneRelaciones = false;
    if (campoVerificacion === 'etapa') {
      tieneRelaciones = casos.some((c) => aMayusculas(c.etapa) === aMayusculas(item.nombre));
    } else if (campoVerificacion === 'calle') {
      tieneRelaciones = casos.some(
        (c) =>
          aMayusculas(c.callePrimaria) === aMayusculas(item.nombre) ||
          aMayusculas(c.calleSecundaria) === aMayusculas(item.nombre)
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
    actualizarItem: () => {},
    toggleEstadoItem: () => {},
    eliminarItem: () => {},
  };
