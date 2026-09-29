import React, { useState } from 'react';
import { Receipt, X } from '@phosphor-icons/react';
import { useAdmin } from './AdminContext';
import { PrintableTicket, Ticket } from './Ticket';
import type { Order, PaymentMethod } from './types';
import { PAYMENT_LABELS, PAYMENT_METHODS } from './posUtils';

export const SaleDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { updateOrder, cancelOrder, showToast } = useAdmin();
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [observacion, setObservacion] = useState(order.observacion ?? '');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isCancelled = order.status === 'anulada';

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
      <div className="modal-overlay">
        <div className="modal-content" style={{ maxWidth: '420px', padding: 0 }}>
          <div className="sale-modal-header">
            <h3><Receipt weight="fill" /> Ticket de Venta</h3>
            <button className="btn-icon" onClick={onClose} aria-label="Cerrar"><X size={24} /></button>
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
              <>
                <button className="btn-secondary" onClick={onClose}>Cerrar</button>
                {!isCancelled && (
                  <>
                    <button className="btn-secondary btn-danger-text" onClick={() => setConfirmingCancel(true)}>Anular</button>
                    <button className="btn-accent" style={{ padding: '0.75rem 1.5rem' }} onClick={handleSave}>Guardar</button>
                  </>
                )}
                <button className="btn-secondary" onClick={() => window.print()}>🖨️</button>
              </>
            )}
          </div>
        </div>
      </div>
      <PrintableTicket order={order} />
    </>
  );
};
