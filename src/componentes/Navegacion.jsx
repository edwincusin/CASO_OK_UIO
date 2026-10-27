import { NavLink, useNavigate } from 'react-router-dom';
import {
  Home,
  ClipboardList,
  PlusCircle,
  Bell,
  Users,
  FolderTree,
  FileText,
  UserCheck,
  Settings,
  LogOut,
} from 'lucide-react';
import LogoQuinde from './LogoQuinde';
import { useSesion } from '../contextos/ContextoSesion';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';
import { etiquetasRol } from '../datos/datosDemo';

export default function Navegacion() {
  const { usuario, cerrarSesion } = useSesion();
  const { contadorPendientes } = useNotificaciones();
  const navegar = useNavigate();

  const esSuper = usuario?.rol === 'superusuario';
  const nombreCompleto = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : 'USUARIO';
  const rolEtiqueta = usuario?.rol ? (etiquetasRol[usuario.rol] || usuario.rol.toUpperCase()) : '';

  function salir() {
    cerrarSesion();
    navegar('/ingreso');
  }

  return (
    <nav className="navegacion navegacion--estilizada">
      {/* BRAND CON LOGO DEL QUINDE (COLIBRÍ) */}
      <div className="marca navegacion__marca">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <LogoQuinde size={34} />
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
            <span style={{ fontWeight: 900, fontSize: '1.05rem', color: '#ffffff', letterSpacing: '0.04em' }}>
              QUINDE CONTROL
            </span>
            <span style={{ fontSize: '0.72rem', color: '#a3e4b0', fontStyle: 'italic', fontWeight: 500 }}>
              Cada caso bajo control.
            </span>
          </div>
        </div>
      </div>

      <div className="navegacion__enlaces">
        <NavLink to="/" end className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
          <Home size={19} />
          <span>Inicio</span>
        </NavLink>

        <NavLink to="/casos" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
          <ClipboardList size={19} />
          <span>Casos</span>
        </NavLink>

        <NavLink to="/casos/nuevo" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
          <PlusCircle size={19} />
          <span>Nuevo</span>
        </NavLink>

        <NavLink
          to="/notificaciones"
          className={({ isActive }) => `navegacion__enlace navegacion__enlace--relativo ${isActive ? 'activo' : ''}`}
        >
          <Bell size={19} />
          <span>Avisos</span>
          {contadorPendientes > 0 && <span className="badge-notificacion">{contadorPendientes}</span>}
        </NavLink>

        {/* Rutas exclusivas para Superusuario */}
        {esSuper && (
          <>
            <NavLink to="/reportes" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
              <FileText size={19} />
              <span>Reportes</span>
            </NavLink>
            <NavLink to="/usuarios" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
              <Users size={19} />
              <span>Usuarios</span>
            </NavLink>
            <NavLink to="/catalogos" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
              <FolderTree size={19} />
              <span>Catálogos</span>
            </NavLink>
            <NavLink to="/configuracion" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
              <Settings size={19} />
              <span>Ajustes</span>
            </NavLink>
          </>
        )}

        <NavLink to="/perfil" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
          <UserCheck size={19} />
          <span>Mi Perfil</span>
        </NavLink>
      </div>

      {/* BLOQUE DE USUARIO Y CIERRE DE SESIÓN EN LA BARRA DE NAVEGACIÓN */}
      <div className="navegacion__usuario-panel">
        <div className="navegacion__usuario-info">
          <span className="navegacion__usuario-nombre">{nombreCompleto}</span>
          <span className="navegacion__usuario-rol">{rolEtiqueta}</span>
        </div>
        <button
          type="button"
          onClick={salir}
          className="boton-cerrar-sesion"
          title="Cerrar sesión"
          aria-label="Cerrar sesión"
        >
          <LogOut size={16} />
          <span className="boton-cerrar-sesion__texto">Salir</span>
        </button>
      </div>
    </nav>
  );
}
