export default function CampoEntrada({
  label,
  name,
  id,
  tipo = 'text',
  valor,
  onChange,
  error,
  requerido = false,
  placeholder = '',
  maxlength,
  disabled = false,
  ...props
}) {
  return (
    <div className="campo-grupo">
      {label && (
        <label className="campo-label" htmlFor={id || name}>
          {label} {requerido && <span className="campo-requerido">*</span>}
        </label>
      )}
      <input
        id={id || name}
        name={name}
        type={tipo}
        value={valor ?? ''}
        onChange={onChange}
        maxLength={maxlength}
        placeholder={placeholder}
        disabled={disabled}
        className={`campo-input ${error ? 'campo-input--error' : ''}`}
        {...props}
      />
      {error && <span className="campo-mensaje-error">{error}</span>}
    </div>
  );
}
