import { useEffect, useState } from 'react'

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onClose, toast.duration ?? 3500);
    return () => clearTimeout(t);
  }, [toast, onClose]);

  if (!toast) return null;
  return (
    <div className={`toast toast-${toast.type || 'info'}`} role="status">
      <div className="toast-icon">
        {toast.type === 'error' ? '!' : toast.type === 'success' ? '✓' : 'i'}
      </div>
      <div className="toast-message">{toast.message}</div>
      <button className="toast-close" onClick={onClose} aria-label="Dismiss">×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);
  return {
    toast,
    show:    (message, type = 'info', duration) => setToast({ message, type, duration }),
    success: (message) => setToast({ message, type: 'success' }),
    error:   (message) => setToast({ message, type: 'error' }),
    dismiss: () => setToast(null),
  };
}
