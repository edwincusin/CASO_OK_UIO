import { AlertCircle } from 'lucide-react';

/**
 * CampoEntrada
 * Componente de entrada accesible con estructura vertical estricta:
 * Etiqueta superior, control con soporte opcional para icono, texto de ayuda y mensaje de error.
 */
export default function CampoEntrada({
  label,
  name,
  id,
  tipo = 'text',
  valor,
  onChange,
  error,
  ayuda,
  icono: Icono,
  requerido = false,
  placeholder = '',
  maxlength,
  disabled = false,
  ...props
}) {
  const campoId = id || name;

  return (
    <div className="campo-grupo">
      {label && (
        <label className="campo-label" htmlFor={campoId}>
          <span>{label}</span>
          {requerido && (
            <span className="campo-requerido" title="Campo obligatorio">
              *
            </span>
          )}
        </label>
      )}

      <div className={Icono ? 'campo-con-icono' : undefined}>
        {Icono && (
          <span className="campo-con-icono__icono" aria-hidden="true">
            <Icono size={18} />
          </span>
        )}
        <input
          id={campoId}
          name={name}
          type={tipo}
          value={valor ?? ''}
          onChange={onChange}
          maxLength={maxlength}
          placeholder={placeholder}
          disabled={disabled}
          className={`campo-input ${error ? 'campo-input--error' : ''}`}
          aria-invalid={Boolean(error)}
          aria-describedby={
            error ? `${campoId}-error` : ayuda ? `${campoId}-ayuda` : undefined
          }
          {...props}
        />
      </div>

      {ayuda && !error && (
        <span id={`${campoId}-ayuda`} className="campo-ayuda">
          {ayuda}
        </span>
      )}

      {error && (
        <span id={`${campoId}-error`} className="campo-mensaje-error" role="alert">
          <AlertCircle size={14} />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}
