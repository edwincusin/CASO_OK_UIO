import { useState } from 'react';
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
  Menu,
  X,
} from 'lucide-react';
import LogoCasoOK from './LogoCasoOK';
import { useSesion } from '../contextos/ContextoSesion';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';
import { etiquetasRol } from '../datos/datosDemo';

/**
 * Navegacion
 * Menú adaptable para CASOOK:
 * - En móvil (<= 768px): Cabecera superior con hamburguesa y botón de salir directo,
 *   más cajón lateral desplegable con enlaces y botón de cerrar sesión siempre visible al final.
 * - En escritorio (>= 769px): Barra lateral fija con degradado verde esmeralda y panel de usuario.
 */

export default function Navegacion() {
  const { usuario, cerrarSesion } = useSesion();
  const { contadorPendientes } = useNotificaciones();
  const navegar = useNavigate();

  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const esSuper = usuario?.rol === 'superusuario';
  const nombreCompleto = usuario ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim() : 'USUARIO';
  const rolEtiqueta = usuario?.rol ? (etiquetasRol[usuario.rol] || usuario.rol.toUpperCase()) : '';

  function salir() {
    setDrawerAbierto(false);
    cerrarSesion();
    navegar('/ingreso');
  }

  function cerrarDrawer() {
    setDrawerAbierto(false);
  }

  return (
    <>
      {/* 1. CABECERA SUPERIOR PARA MÓVILES (<= 768px) */}
      <header className="cabecera-movil">
        <button
          type="button"
          className="cabecera-movil__boton-hamburguesa"
          onClick={() => setDrawerAbierto(true)}
          aria-label="Abrir menú de navegación"
        >
          <Menu size={24} />
        </button>

        <LogoCasoOK size="sm" />

        <div className="cabecera-movil__acciones">
          <NavLink
            to="/notificaciones"
            className="cabecera-movil__btn-accion"
            title="Avisos y notificaciones"
            aria-label="Notificaciones"
          >
            <Bell size={20} />
            {contadorPendientes > 0 && (
              <span className="badge-notificacion" style={{ position: 'absolute', top: 4, right: 4 }}>
                {contadorPendientes}
              </span>
            )}
          </NavLink>

          <button
            type="button"
            className="cabecera-movil__btn-accion cabecera-movil__btn-accion--salir"
            onClick={salir}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* 2. CAJÓN LATERAL MÓVIL (DRAWER) CON FONDO OSCURO */}
      {drawerAbierto && (
        <>
          <div className="drawer-fondo" onClick={cerrarDrawer} aria-hidden="true" />
          <aside className="drawer-menu">
            <div className="drawer-menu__cabecera">
              <LogoCasoOK size="sm" />
              <button
                type="button"
                className="drawer-menu__btn-cerrar"
                onClick={cerrarDrawer}
                aria-label="Cerrar menú"
              >
                <X size={22} />
              </button>
            </div>

            <div className="drawer-menu__usuario">
              <span className="drawer-menu__usuario-nombre">{nombreCompleto}</span>
              <span className="drawer-menu__usuario-rol">{rolEtiqueta}</span>
            </div>

            <nav className="drawer-menu__enlaces">
              <NavLink to="/" end className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                <Home size={20} />
                <span>Inicio</span>
              </NavLink>

              <NavLink to="/casos" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                <ClipboardList size={20} />
                <span>Casos</span>
              </NavLink>

              <NavLink to="/casos/nuevo" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                <PlusCircle size={20} />
                <span>Nueva Novedad</span>
              </NavLink>

              <NavLink to="/notificaciones" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                <Bell size={20} />
                <span>Avisos ({contadorPendientes})</span>
              </NavLink>

              {esSuper && (
                <>
                  <NavLink to="/reportes" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                    <FileText size={20} />
                    <span>Reportes PDF</span>
                  </NavLink>
                  <NavLink to="/usuarios" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                    <Users size={20} />
                    <span>Usuarios</span>
                  </NavLink>
                  <NavLink to="/catalogos" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                    <FolderTree size={20} />
                    <span>Catálogos</span>
                  </NavLink>
                  <NavLink to="/configuracion" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                    <Settings size={20} />
                    <span>Configuración</span>
                  </NavLink>
                </>
              )}

              <NavLink to="/perfil" className={({ isActive }) => `drawer-menu__enlace ${isActive ? 'activo' : ''}`} onClick={cerrarDrawer}>
                <UserCheck size={20} />
                <span>Mi Perfil</span>
              </NavLink>
            </nav>

            <div className="drawer-menu__pie">
              <button
                type="button"
                className="drawer-menu__btn-salir"
                onClick={salir}
              >
                <LogOut size={18} />
                <span>CERRAR SESIÓN</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* 3. BARRA LATERAL EN ESCRITORIO (>= 769px) */}
      <nav className="navegacion" aria-label="Menú principal de escritorio">
        <div className="marca navegacion__marca">
          <LogoCasoOK size="md" />
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
            <span>Nueva Novedad</span>
          </NavLink>

          <NavLink
            to="/notificaciones"
            className={({ isActive }) => `navegacion__enlace navegacion__enlace--relativo ${isActive ? 'activo' : ''}`}
          >
            <Bell size={19} />
            <span>Avisos</span>
            {contadorPendientes > 0 && <span className="badge-notificacion">{contadorPendientes}</span>}
          </NavLink>

          {esSuper && (
            <>
              <NavLink to="/reportes" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
                <FileText size={19} />
                <span>Reportes PDF</span>
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
                <span>Configuración</span>
              </NavLink>
            </>
          )}

          <NavLink to="/perfil" className={({ isActive }) => `navegacion__enlace ${isActive ? 'activo' : ''}`}>
            <UserCheck size={19} />
            <span>Mi Perfil</span>
          </NavLink>
        </div>

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
            <span>Salir</span>
          </button>
        </div>
      </nav>
    </>
  );
}
