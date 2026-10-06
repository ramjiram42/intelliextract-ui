import React from 'react';

export default function ToastContainer({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container-stack">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast-notification-item ${toast.type || 'info'}`}>
          <div className="toast-icon">
            {toast.type === 'success' && '✓'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'error' && '✗'}
            {(!toast.type || toast.type === 'info') && 'ℹ'}
          </div>
          <div className="toast-body">
            <span className="toast-message">{toast.message}</span>
          </div>
          <button
            className="toast-close-btn"
            onClick={() => onDismiss(toast.id)}
            title="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
