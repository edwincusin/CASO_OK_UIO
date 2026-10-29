import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import Navegacion from './Navegacion';
import { useConfiguracion } from '../contextos/ContextoConfiguracion';
import { useSesion } from '../contextos/ContextoSesion';
import { useNotificaciones } from '../contextos/ContextoNotificaciones';

/**
 * DisenoPrincipal
 * Estructura de la aplicación con Grid de 2 columnas (.aplicacion),
 * menú lateral estático que nunca hace scroll con la página,
 * cabecera superior sticky con desenfoque suave y sombra, y área de trabajo con scroll independiente.
 */
export default function DisenoPrincipal() {
  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const { nombreUrbanizacion } = useConfiguracion();
  const { cerrarSesion } = useSesion();
  const { contadorPendientes } = useNotificaciones();
  const navegar = useNavigate();

  function salir() {
    setDrawerAbierto(false);
    cerrarSesion();
    navegar('/ingreso');
  }

  const textoUrbanizacion = (nombreUrbanizacion || 'URBANIZACIÓN EL CONDADO').toUpperCase();

  return (
    <div className="aplicacion">
      {/* Menú lateral de escritorio y drawer para móviles */}
      <Navegacion
        drawerAbierto={drawerAbierto}
        setDrawerAbierto={setDrawerAbierto}
        salir={salir}
      />

      {/* Contenedor principal con scroll vertical independiente */}
      <div className="contenido-principal">
        {/* Cabecera superior sticky con desenfoque de fondo */}
        <header className="cabecera-superior">
          <button
            type="button"
            className="cabecera-superior__hamburguesa"
            onClick={() => setDrawerAbierto(true)}
            aria-label="Abrir menú de navegación"
          >
            <Menu size={24} />
          </button>

          <div className="cabecera-superior__centro">
            <span className="cabecera-superior__urbanizacion" title={textoUrbanizacion}>
              {textoUrbanizacion}
            </span>
          </div>

          <div className="cabecera-superior__acciones">
            <NavLink
              to="/notificaciones"
              className="cabecera-superior__btn-accion"
              title="Avisos y notificaciones"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              {contadorPendientes > 0 && (
                <span
                  className="badge-contador"
                  style={{ position: 'absolute', top: 4, right: 4 }}
                >
                  {contadorPendientes}
                </span>
              )}
            </NavLink>

            <button
              type="button"
              className="cabecera-superior__btn-accion cabecera-superior__btn-accion--salir"
              onClick={salir}
              title="Cerrar sesión"
              aria-label="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Área de trabajo donde se renderizan las vistas */}
        <main className="area-trabajo">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
