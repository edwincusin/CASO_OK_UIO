import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProveedorSesion } from './contextos/ContextoSesion';
import { ProveedorCatalogos } from './contextos/ContextoCatalogos';
import { ProveedorCasos } from './contextos/ContextoCasos';
import { ProveedorToast } from './contextos/ContextoToast';
import { ProveedorNotificaciones } from './contextos/ContextoNotificaciones';

import RutaProtegida from './componentes/RutaProtegida';
import DisenoPrincipal from './componentes/DisenoPrincipal';

import Ingreso from './paginas/Ingreso';
import Inicio from './paginas/Inicio';
import Casos from './paginas/Casos';
import CasoNuevo from './paginas/CasoNuevo';
import CasoDetalle from './paginas/CasoDetalle';
import Reportes from './paginas/Reportes';
import Usuarios from './paginas/Usuarios';
import Catalogos from './paginas/Catalogos';
import Perfil from './paginas/Perfil';
import Notificaciones from './paginas/Notificaciones';
import Configuracion from './paginas/Configuracion';

export default function App() {
  return (
    <ProveedorSesion>
      <ProveedorCatalogos>
        <ProveedorCasos>
          <ProveedorToast>
            <ProveedorNotificaciones>
              <BrowserRouter>
                <Routes>
                  <Route path="/ingreso" element={<Ingreso />} />

                  <Route element={<RutaProtegida />}>
                    <Route element={<DisenoPrincipal />}>
                      <Route path="/" element={<Inicio />} />
                      <Route path="/casos" element={<Casos />} />
                      <Route path="/casos/nuevo" element={<CasoNuevo />} />
                      <Route path="/casos/:idCaso" element={<CasoDetalle />} />
                      <Route path="/reportes" element={<Reportes />} />
                      <Route path="/usuarios" element={<Usuarios />} />
                      <Route path="/catalogos" element={<Catalogos />} />
                      <Route path="/perfil" element={<Perfil />} />
                      <Route path="/notificaciones" element={<Notificaciones />} />
                      <Route path="/configuracion" element={<Configuracion />} />
                    </Route>
                  </Route>
                </Routes>
              </BrowserRouter>
            </ProveedorNotificaciones>
          </ProveedorToast>
        </ProveedorCasos>
      </ProveedorCatalogos>
    </ProveedorSesion>
  );
}
