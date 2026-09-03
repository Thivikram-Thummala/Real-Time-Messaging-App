import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const isDanger = confirmVariant === 'danger';

  return (
    <div className="modal-overlay">
      <div className="auth-modal" style={{ maxWidth: '420px', width: '90%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: isDanger ? '#ef4444' : 'var(--text)'
          }}>
            <AlertTriangle size={20} color={isDanger ? '#ef4444' : 'var(--warning)'} />
            {title}
          </h3>
          <button className="mobile-close-btn" onClick={onCancel}><X size={18} /></button>
        </div>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.4' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button className="sec" onClick={onCancel} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '0.5rem 1.1rem',
              fontSize: '0.85rem',
              borderRadius: '8px',
              fontWeight: 600,
              border: 'none',
              background: isDanger ? '#ef4444' : 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              boxShadow: isDanger ? '0 2px 8px rgba(239, 68, 68, 0.3)' : '0 2px 8px rgba(99, 102, 241, 0.3)'
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
