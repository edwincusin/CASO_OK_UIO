import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ContextoToast = createContext(null);

/**
 * ProveedorToast
 * Notificaciones efímeras accesibles con barra de progreso animada
 * y posicionamiento responsive (abajo en móvil, arriba derecha en escritorio).
 */
export function ProveedorToast({ children }) {
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    const textoMensaje = String(mensaje || '');
    setToast({ mensaje: textoMensaje, tipo });

    setTimeout(() => {
      setToast((actual) => (actual?.mensaje === textoMensaje ? null : actual));
    }, 3000);
  }, []);

  return (
    <ContextoToast.Provider value={{ mostrarToast }}>
      {children}
      {toast && (
        <div className="contenedor-toasts toast-contenedor" role="status" aria-live="polite">
          <div className={`toast toast--${toast.tipo}`}>
            <span className="toast__icono" aria-hidden="true">
              {toast.tipo === 'exito' && <CheckCircle2 size={18} />}
              {toast.tipo === 'alerta' && <AlertCircle size={18} />}
              {toast.tipo === 'info' && <Info size={18} />}
            </span>
            <span className="toast__mensaje">{toast.mensaje}</span>
            <span className="toast__barra-progreso" aria-hidden="true" />
          </div>
        </div>
      )}
    </ContextoToast.Provider>
  );
}

export const useToast = () =>
  useContext(ContextoToast) || { mostrarToast: () => {} };
