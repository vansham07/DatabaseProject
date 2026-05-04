export function ErrorBanner({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="banner banner-error" role="alert">
      <div className="banner-icon">!</div>
      <div className="banner-text">{message}</div>
      {onClose && (
        <button className="banner-close" onClick={onClose} aria-label="Dismiss">×</button>
      )}
    </div>
  );
}

export function FormErrorSummary({ errors }) {
  const items = Object.entries(errors || {});
  if (items.length === 0) return null;
  return (
    <div className="banner banner-error" role="alert">
      <div className="banner-icon">!</div>
      <div className="banner-text">
        <strong>Please fix the following:</strong>
        <ul className="banner-list">
          {items.map(([field, msg]) => <li key={field}>{msg}</li>)}
        </ul>
      </div>
    </div>
  );
}
