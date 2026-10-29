/**
 * Insignia / Badge
 * Indicador visual con punto semántico y texto contrastado.
 */
export default function Insignia({ texto, color, variante }) {
  const claseVariante = variante ? `badge--${variante}` : '';

  return (
    <span
      className={`badge ${claseVariante}`}
      style={color && !variante ? { backgroundColor: `${color}15`, color: color } : undefined}
    >
      <span
        className="badge__punto"
        style={color && !variante ? { backgroundColor: color } : undefined}
        aria-hidden="true"
      />
      <span>{texto}</span>
    </span>
  );
}
