import { useConfiguracion } from '../contextos/ContextoConfiguracion';

/**
 * PiePagina
 * Pie de página institucional con la marca CASOOK y el nombre de la urbanización configurable.
 */
export default function PiePagina() {
  const { nombreUrbanizacion } = useConfiguracion();

  return (
    <footer className="footer-institucional">
      <div className="footer-contenido">
        <p className="footer-titulo">CASOOK</p>
        <p className="footer-subtitulo">SISTEMA INTERNO DE GESTIÓN Y SEGUIMIENTO</p>
        <p className="footer-urbanizacion">{nombreUrbanizacion || 'Nombre de la Urbanización'}</p>
      </div>
    </footer>
  );
}
