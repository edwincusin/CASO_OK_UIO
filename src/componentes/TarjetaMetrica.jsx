import React from 'react';

/**
 * TarjetaMetrica
 * Métrica KPI del dashboard con icono estructurado, valor tabular en grande
 * y etiqueta en mayúsculas discretas.
 */
export default function TarjetaMetrica({
  titulo,
  valor,
  icono,
  color,
  destaca = false,
  subtexto,
}) {
  return (
    <div
      className={`tarjeta-metrica ${destaca ? 'tarjeta-metrica--destacada' : ''}`}
      style={color && !destaca ? { borderLeft: `4px solid ${color}` } : undefined}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="tarjeta-metrica__etiqueta">{titulo}</span>
        {icono && (
          <div
            className="tarjeta-metrica__icono"
            style={color && !destaca ? { color: color, backgroundColor: `${color}15` } : undefined}
          >
            {React.cloneElement(icono, { size: 18 })}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
        <span
          className="tarjeta-metrica__valor"
          style={destaca ? { color: 'var(--color-peligro)' } : undefined}
        >
          {valor}
        </span>
        {subtexto && <span className="texto-tenue">{subtexto}</span>}
      </div>
    </div>
  );
}
