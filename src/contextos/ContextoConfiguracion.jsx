import { createContext, useContext, useState } from 'react';

/**
 * ContextoConfiguracion
 * Administra el nombre de la urbanización y ajustes del sistema CASOOK.
 * Persiste los datos en localStorage bajo manejo seguro con try/catch.
 */

const CLAVE_LOCALSTORAGE = 'casook_configuracion_v1';
const VALOR_DEFECTO = 'Nombre de la Urbanización';

export const ContextoConfiguracion = createContext({
  nombreUrbanizacion: VALOR_DEFECTO,
  guardarNombreUrbanizacion: () => {},
});

export function ProveedorConfiguracion({ children }) {
  const [nombreUrbanizacion, setNombreUrbanizacion] = useState(() => {
    try {
      const guardado = localStorage.getItem(CLAVE_LOCALSTORAGE);
      if (guardado) {
        const datos = JSON.parse(guardado);
        if (datos && typeof datos.nombreUrbanizacion === 'string' && datos.nombreUrbanizacion.trim()) {
          return datos.nombreUrbanizacion.trim();
        }
      }
    } catch (e) {
      console.warn('No se pudo leer la configuración de localStorage:', e);
    }
    return VALOR_DEFECTO;
  });

  const guardarNombreUrbanizacion = (nuevoNombre) => {
    const limpio = (nuevoNombre || '').trim();
    if (limpio.length < 3 || limpio.length > 60) {
      throw new Error('El nombre de la urbanización debe tener entre 3 y 60 caracteres.');
    }
    setNombreUrbanizacion(limpio);
    try {
      localStorage.setItem(CLAVE_LOCALSTORAGE, JSON.stringify({ nombreUrbanizacion: limpio }));
    } catch (e) {
      console.warn('No se pudo guardar la configuración en localStorage:', e);
    }
  };

  return (
    <ContextoConfiguracion.Provider value={{ nombreUrbanizacion, guardarNombreUrbanizacion }}>
      {children}
    </ContextoConfiguracion.Provider>
  );
}

export function useConfiguracion() {
  return useContext(ContextoConfiguracion);
}
