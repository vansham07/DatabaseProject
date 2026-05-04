// Generic form field that renders a label, an input/select/textarea
// (chosen via the `as` prop or children), and an inline error message.

export function Field({
  label, name, value, onChange, onBlur,
  error, required, hint, type = 'text', as,
  children, full, ...rest
}) {
  const id = `f-${name}`;
  const hasError = Boolean(error);
  const className = `field-input${hasError ? ' has-error' : ''}`;

  let control;
  if (as === 'select') {
    control = (
      <select id={id} name={name} value={value ?? ''}
              onChange={onChange} onBlur={onBlur}
              className={className} {...rest}>
        {children}
      </select>
    );
  } else if (as === 'textarea') {
    control = (
      <textarea id={id} name={name} value={value ?? ''}
                onChange={onChange} onBlur={onBlur}
                className={className} {...rest} />
    );
  } else {
    control = (
      <input id={id} name={name} type={type} value={value ?? ''}
             onChange={onChange} onBlur={onBlur}
             className={className}
             aria-invalid={hasError || undefined}
             aria-describedby={hasError ? `${id}-err` : undefined}
             {...rest} />
    );
  }

  return (
    <div className={`field${full ? ' field-full' : ''}`}>
      <label htmlFor={id}>
        {label}{required && <span className="req">*</span>}
      </label>
      {control}
      {hasError ? (
        <div id={`${id}-err`} className="field-error" role="alert">
          <ErrorIcon /> {error}
        </div>
      ) : hint ? (
        <div className="field-hint">{hint}</div>
      ) : null}
    </div>
  );
}

function ErrorIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
         aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8"  x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}
