/**
 * BannerUrbanizacion
 * Muestra el nombre configurado de la urbanización de forma atractiva y centrada,
 * en mayúsculas con espaciado, degradado dorado y líneas decorativas a los lados.
 * Compatible con móviles y escritorio mediante CSS3 puro.
 */
import { useConfiguracion } from '../contextos/ContextoConfiguracion';

export default function BannerUrbanizacion({ enLogin = false }) {
  const { nombreUrbanizacion } = useConfiguracion();
  const textoAMostrar = (nombreUrbanizacion || 'NOMBRE DE LA URBANIZACIÓN').toUpperCase();

  return (
    <div className={`banner-urbanizacion ${enLogin ? 'banner-urbanizacion--login' : ''}`}>
      <span className="banner-urbanizacion__linea" aria-hidden="true" />
      <span className="banner-urbanizacion__texto" title={textoAMostrar}>
        {textoAMostrar}
      </span>
      <span className="banner-urbanizacion__linea" aria-hidden="true" />
    </div>
  );
}
