// Logo oficial de CasoOK con pastilla dorada y check integrado
export default function LogoCasoOK({ size = 'md', variante = 'clara', className = '' }) {
  const varianteClase = variante === 'oscura' ? 'casook-logo--oscuro' : '';
  const tamanoClase = `casook-logo--${size}`;

  return (
    <div className={`casook-logo ${tamanoClase} ${varianteClase} ${className}`.trim()} role="img" aria-label="Logo CasoOK">
      <span className="casook-logo__texto-caso">CASO</span>
      <span className="casook-logo__pastilla">
        <span>OK</span>
        <svg
          className="casook-logo__check-svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </span>
    </div>
  );
}
