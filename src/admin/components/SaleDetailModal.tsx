import React, { useState } from 'react';
import { Receipt } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { PrintableTicket, Ticket } from './Ticket';
import type { Order, PaymentMethod } from '../types';
import { PAYMENT_LABELS, PAYMENT_METHODS } from '../utils/posUtils';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

export const SaleDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { updateOrder, cancelOrder } = useAdmin();
  const { showToast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [observacion, setObservacion] = useState(order.observacion ?? '');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isCancelled = order.status === 'anulada';

  const { handleBackdropClick } = useModalDismiss({ onClose, closeOnBackdrop: true });

  const handleSave = () => {
    updateOrder(order.id, { paymentMethod: method, observacion: observacion.trim() });
    showToast('Venta actualizada', 'success');
  };

  const handleCancel = () => {
    if (!observacion.trim()) {
      showToast('Indicá el motivo de la anulación.', 'error');
      return;
    }
    cancelOrder(order.id, observacion.trim());
    showToast('Venta anulada y stock repuesto', 'success');
    setConfirmingCancel(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick}>
        <div className="modal-content" style={{ maxWidth: '420px', padding: 0 }}>
          <div className="sale-modal-header">
            <h3><Receipt weight="fill" /> Ticket de Venta</h3>
            <ModalCloseButton onClick={onClose} />
          </div>

          <div style={{ padding: '1.5rem', background: 'var(--bg-color)' }}>
            <Ticket order={order} />
          </div>

          <div className="sale-modal-edit">
            <div className="form-group">
              <label>Método de pago</label>
              <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} disabled={isCancelled}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Observación</label>
              <input type="text" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej: se cobró como efectivo pero transfirió" disabled={isCancelled} />
            </div>
          </div>

          <div className="sale-modal-footer">
            {confirmingCancel ? (
              <>
                <span className="sale-modal-warning">¿Anular esta venta? Se repone el stock.</span>
                <button className="btn-secondary" onClick={() => setConfirmingCancel(false)}>No</button>
                <button className="btn-accent btn-danger" onClick={handleCancel}>Sí, anular</button>
              </>
            ) : (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-icon" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem' }} onClick={() => window.print()} title="Imprimir" aria-label="Imprimir ticket">
                  🖨️
                </button>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                  {!isCancelled && (
                    <>
                      <button className="btn-secondary btn-danger-text" onClick={() => setConfirmingCancel(true)}>Anular</button>
                      <button className="btn-accent" style={{ padding: '0.75rem 1.5rem' }} onClick={handleSave}>Guardar</button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <PrintableTicket order={order} />
    </>
  );
};
