import { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

const ContextoToast = createContext(null);

export function ProveedorToast({ children }) {
  const [toast, setToast] = useState(null);

  const mostrarToast = useCallback((mensaje, tipo = 'exito') => {
    const textoMayusculas = String(mensaje || '').toUpperCase();
    setToast({ mensaje: textoMayusculas, tipo });

    setTimeout(() => {
      setToast((actual) => (actual?.mensaje === textoMayusculas ? null : actual));
    }, 3000); // Duración fija de 3 segundos
  }, []);

  return (
    <ContextoToast.Provider value={{ mostrarToast }}>
      {children}
      {toast && (
        <div className="toast-contenedor">
          <div className={`toast toast--${toast.tipo}`}>
            {toast.tipo === 'exito' && <CheckCircle2 size={18} />}
            {toast.tipo === 'alerta' && <AlertCircle size={18} />}
            {toast.tipo === 'info' && <Info size={18} />}
            <span>{toast.mensaje}</span>
          </div>
        </div>
      )}
    </ContextoToast.Provider>
  );
}

export const useToast = () => useContext(ContextoToast) || { mostrarToast: () => {} };
