import { createContext, useContext, useState } from 'react';
import { notificacionesDemoIniciales } from '../datos/datosDemo';

const ContextoNotificaciones = createContext(null);

export function ProveedorNotificaciones({ children }) {
  const [notificaciones, setNotificaciones] = useState(notificacionesDemoIniciales);

  const contadorPendientes = notificaciones.filter((n) => !n.leida).length;

  function marcarLeida(id) {
    setNotificaciones((lista) =>
      lista.map((n) => (n.id === id ? { ...n, leida: true } : n))
    );
  }

  function marcarTodasLeidas() {
    setNotificaciones((lista) => lista.map((n) => ({ ...n, leida: true })));
  }

  function agregarNotificacion(nueva) {
    const nuevoId = notificaciones.length > 0 ? Math.max(...notificaciones.map((n) => n.id)) + 1 : 1;
    setNotificaciones([
      {
        ...nueva,
        id: nuevoId,
        leida: false,
        fecha: new Date().toISOString().slice(0, 10),
      },
      ...notificaciones,
    ]);
  }

  return (
    <ContextoNotificaciones.Provider
      value={{
        notificaciones,
        contadorPendientes,
        marcarLeida,
        marcarTodasLeidas,
        agregarNotificacion,
      }}
    >
      {children}
    </ContextoNotificaciones.Provider>
  );
}

export const useNotificaciones = () => useContext(ContextoNotificaciones) || {
  notificaciones: [],
  contadorPendientes: 0,
  marcarLeida: () => {},
  marcarTodasLeidas: () => {},
};
