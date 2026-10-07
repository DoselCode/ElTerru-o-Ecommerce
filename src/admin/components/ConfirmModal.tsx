import React from 'react';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface ConfirmModalProps {
  title?: string;
  message: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title = 'Confirmar Acción', message, onConfirm, onCancel,
  confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', isDestructive = false,
}) => {
  const { handleBackdropClick } = useModalDismiss({ onClose: onCancel, closeOnBackdrop: false });

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content card" style={{ maxWidth: '400px' }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="sale-modal-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>{title}</h2>
          <ModalCloseButton onClick={onCancel} />
        </div>
        <p style={{ fontSize: '1.1rem', textAlign: 'center', padding: '1rem 0' }}>{message}</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>{cancelLabel}</button>
          <button className={isDestructive ? 'btn-accent btn-danger' : 'btn-accent'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;