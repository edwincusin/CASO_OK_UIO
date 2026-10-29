import { Outlet } from 'react-router-dom';
import Navegacion from './Navegacion';
import BannerUrbanizacion from './BannerUrbanizacion';

/**
 * DisenoPrincipal
 * Marco estructural de la aplicación autenticada.
 * Incluye la navegación responsiva, el banner dorado institucional y el área de contenido.
 */
export default function DisenoPrincipal() {
  return (
    <div className="diseno">
      <Navegacion />
      <div className="diseno__principal">
        <BannerUrbanizacion />
        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
