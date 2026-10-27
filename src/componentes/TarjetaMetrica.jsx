import React from 'react';

export default function TarjetaMetrica({ titulo, valor, icono, color, destaca = false, subtexto }) {
  const colorBorde = color || 'var(--color-primario)';

  return (
    <div
      className={`tarjeta tarjeta-metrica ${destaca ? 'tarjeta-metrica--destacada' : ''}`}
      style={{
        borderLeft: `5px solid ${colorBorde}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span className="texto-tenue" style={{ fontWeight: 700, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
          {titulo.toUpperCase()}
        </span>
        <div
          style={{
            color: colorBorde,
            background: 'rgba(0, 0, 0, 0.04)',
            padding: '0.4rem',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {React.cloneElement(icono, { size: 18 })}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span
          className="tarjeta-metrica__valor"
          style={{
            fontSize: '1.9rem',
            fontWeight: 800,
            lineHeight: 1,
            color: destaca ? 'var(--color-alerta)' : 'var(--color-texto)',
          }}
        >
          {valor}
        </span>
        {subtexto && <span className="texto-tenue" style={{ fontSize: '0.75rem' }}>{subtexto}</span>}
      </div>
    </div>
  );
}
