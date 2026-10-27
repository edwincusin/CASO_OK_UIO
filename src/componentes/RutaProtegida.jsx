import { Navigate, Outlet } from 'react-router-dom';
import { useSesion } from '../contextos/ContextoSesion';

// Si no hay sesión, manda a la pantalla de ingreso
export default function RutaProtegida() {
  const { usuario } = useSesion();
  if (!usuario) return <Navigate to="/ingreso" replace />;
  return <Outlet />;
}
