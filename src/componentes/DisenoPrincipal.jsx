import { Outlet } from 'react-router-dom';
import Navegacion from './Navegacion';

// Marco principal sin encabezado superior ni pie de página, según requerimiento de usuario
export default function DisenoPrincipal() {
  return (
    <div className="diseno">
      <Navegacion />
      <div className="diseno__principal">
        <main className="contenido">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
