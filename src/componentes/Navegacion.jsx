import { useEffect } from 'react';
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
  X,
} from 'lucide-react';
import LogoCasoOK from './LogoCasoOK';
import { useSesion } from '../contextos/ContextoSesion';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';
import { etiquetasRol } from '../datos/datosDemo';

/**
 * Navegacion
 * Menú lateral fijo de 260px en escritorio con scroll interno independiente,
 * tarjeta de usuario inferior siempre fija, y drawer deslizante para móviles (<= 768px).
 */
export default function Navegacion({ drawerAbierto, setDrawerAbierto, salir }) {
  const { usuario } = useSesion();
  const { contadorPendientes } = useNotificaciones();
  const navegar = useNavigate();

  const esSuper = usuario?.rol === 'superusuario';
  const nombreCompleto = usuario
    ? `${usuario.nombre || ''} ${usuario.apellido || ''}`.trim()
    : 'USUARIO';
  const rolEtiqueta = usuario?.rol
    ? etiquetasRol[usuario.rol] || usuario.rol.toUpperCase()
    : 'INVITADO';

  function manejarSalir() {
    if (salir) {
      salir();
    } else {
      setDrawerAbierto(false);
      navegar('/ingreso');
    }
  }

  function cerrarDrawer() {
    setDrawerAbierto(false);
  }

  // Bloqueo del scroll del body mientras el cajón móvil está abierto
  useEffect(() => {
    if (drawerAbierto) {
      document.body.style.overflow = 'hidden';
      function onKeyDown(e) {
        if (e.key === 'Escape') setDrawerAbierto(false);
      }
      window.addEventListener('keydown', onKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', onKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [drawerAbierto, setDrawerAbierto]);

  return (
    <>
      {/* ===== 1. DRAWER MÓVIL DESLIZANTE (<= 768px) ===== */}
      {drawerAbierto && (
        <>
          <div
            className="drawer-fondo"
            onClick={cerrarDrawer}
            aria-hidden="true"
          />
          <aside
            className="drawer-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación móvil"
          >
            <div className="drawer-panel__cabecera">
              <LogoCasoOK size="sm" />
              <button
                type="button"
                className="drawer-panel__btn-cerrar"
                onClick={cerrarDrawer}
                aria-label="Cerrar menú"
              >
                <X size={24} />
              </button>
            </div>

            <div className="drawer-panel__usuario">
              <span className="drawer-panel__usuario-nombre">{nombreCompleto}</span>
              <span className="drawer-panel__usuario-rol">{rolEtiqueta}</span>
            </div>

            <nav className="drawer-panel__enlaces">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                }
                onClick={cerrarDrawer}
              >
                <Home size={20} />
                <span>Inicio</span>
              </NavLink>

              <NavLink
                to="/casos"
                className={({ isActive }) =>
                  `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                }
                onClick={cerrarDrawer}
              >
                <ClipboardList size={20} />
                <span>Casos</span>
              </NavLink>

              <NavLink
                to="/casos/nuevo"
                className={({ isActive }) =>
                  `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                }
                onClick={cerrarDrawer}
              >
                <PlusCircle size={20} />
                <span>Nueva Novedad</span>
              </NavLink>

              <NavLink
                to="/notificaciones"
                className={({ isActive }) =>
                  `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                }
                onClick={cerrarDrawer}
              >
                <Bell size={20} />
                <span>Avisos</span>
                {contadorPendientes > 0 && (
                  <span className="badge-contador">{contadorPendientes}</span>
                )}
              </NavLink>

              {esSuper && (
                <>
                  <div className="menu-lateral__seccion-titulo" style={{ paddingLeft: '8px' }}>
                    Administración
                  </div>
                  <NavLink
                    to="/reportes"
                    className={({ isActive }) =>
                      `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                    }
                    onClick={cerrarDrawer}
                  >
                    <FileText size={20} />
                    <span>Reportes PDF</span>
                  </NavLink>
                  <NavLink
                    to="/usuarios"
                    className={({ isActive }) =>
                      `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                    }
                    onClick={cerrarDrawer}
                  >
                    <Users size={20} />
                    <span>Usuarios</span>
                  </NavLink>
                  <NavLink
                    to="/catalogos"
                    className={({ isActive }) =>
                      `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                    }
                    onClick={cerrarDrawer}
                  >
                    <FolderTree size={20} />
                    <span>Catálogos</span>
                  </NavLink>
                  <NavLink
                    to="/configuracion"
                    className={({ isActive }) =>
                      `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                    }
                    onClick={cerrarDrawer}
                  >
                    <Settings size={20} />
                    <span>Configuración</span>
                  </NavLink>
                </>
              )}

              <NavLink
                to="/perfil"
                className={({ isActive }) =>
                  `drawer-panel__enlace ${isActive ? 'activo' : ''}`
                }
                onClick={cerrarDrawer}
              >
                <UserCheck size={20} />
                <span>Mi Perfil</span>
              </NavLink>
            </nav>

            <div className="drawer-panel__pie">
              <button
                type="button"
                className="drawer-panel__btn-salir"
                onClick={manejarSalir}
              >
                <LogOut size={18} />
                <span>CERRAR SESIÓN</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* ===== 2. MENÚ LATERAL ESTÁTICO EN ESCRITORIO (>= 769px) ===== */}
      <aside className="menu-lateral" aria-label="Navegación principal">
        <div className="menu-lateral__cabecera">
          <LogoCasoOK size="md" />
        </div>

        <nav className="menu-lateral__navegacion">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `menu-lateral__enlace ${isActive ? 'activo' : ''}`
            }
          >
            <span className="menu-lateral__enlace-icono">
              <Home size={19} />
            </span>
            <span>Inicio</span>
          </NavLink>

          <NavLink
            to="/casos"
            className={({ isActive }) =>
              `menu-lateral__enlace ${isActive ? 'activo' : ''}`
            }
          >
            <span className="menu-lateral__enlace-icono">
              <ClipboardList size={19} />
            </span>
            <span>Casos</span>
          </NavLink>

          <NavLink
            to="/casos/nuevo"
            className={({ isActive }) =>
              `menu-lateral__enlace ${isActive ? 'activo' : ''}`
            }
          >
            <span className="menu-lateral__enlace-icono">
              <PlusCircle size={19} />
            </span>
            <span>Nueva Novedad</span>
          </NavLink>

          <NavLink
            to="/notificaciones"
            className={({ isActive }) =>
              `menu-lateral__enlace ${isActive ? 'activo' : ''}`
            }
          >
            <span className="menu-lateral__enlace-icono">
              <Bell size={19} />
            </span>
            <span>Avisos</span>
            {contadorPendientes > 0 && (
              <span className="menu-lateral__badge">{contadorPendientes}</span>
            )}
          </NavLink>

          {esSuper && (
            <>
              <div className="menu-lateral__seccion-titulo">Administración</div>
              <NavLink
                to="/reportes"
                className={({ isActive }) =>
                  `menu-lateral__enlace ${isActive ? 'activo' : ''}`
                }
              >
                <span className="menu-lateral__enlace-icono">
                  <FileText size={19} />
                </span>
                <span>Reportes PDF</span>
              </NavLink>
              <NavLink
                to="/usuarios"
                className={({ isActive }) =>
                  `menu-lateral__enlace ${isActive ? 'activo' : ''}`
                }
              >
                <span className="menu-lateral__enlace-icono">
                  <Users size={19} />
                </span>
                <span>Usuarios</span>
              </NavLink>
              <NavLink
                to="/catalogos"
                className={({ isActive }) =>
                  `menu-lateral__enlace ${isActive ? 'activo' : ''}`
                }
              >
                <span className="menu-lateral__enlace-icono">
                  <FolderTree size={19} />
                </span>
                <span>Catálogos</span>
              </NavLink>
              <NavLink
                to="/configuracion"
                className={({ isActive }) =>
                  `menu-lateral__enlace ${isActive ? 'activo' : ''}`
                }
              >
                <span className="menu-lateral__enlace-icono">
                  <Settings size={19} />
                </span>
                <span>Configuración</span>
              </NavLink>
            </>
          )}

          <div className="menu-lateral__seccion-titulo">Cuenta</div>
          <NavLink
            to="/perfil"
            className={({ isActive }) =>
              `menu-lateral__enlace ${isActive ? 'activo' : ''}`
            }
          >
            <span className="menu-lateral__enlace-icono">
              <UserCheck size={19} />
            </span>
            <span>Mi Perfil</span>
          </NavLink>
        </nav>

        {/* Tarjeta de usuario inferior siempre visible */}
        <div className="menu-lateral__usuario">
          <div className="menu-lateral__usuario-tarjeta">
            <div className="menu-lateral__usuario-detalles">
              <span className="menu-lateral__usuario-nombre" title={nombreCompleto}>
                {nombreCompleto}
              </span>
              <span className="menu-lateral__usuario-rol">{rolEtiqueta}</span>
            </div>
            <button
              type="button"
              className="menu-lateral__btn-salir"
              onClick={manejarSalir}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
