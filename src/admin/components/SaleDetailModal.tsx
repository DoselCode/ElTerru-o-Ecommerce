import React, { useState } from 'react';
import { Printer, Receipt, Warning } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import { PrintableTicket, Ticket } from './Ticket';
import type { Order, PaymentMethod } from '../types';
import { PAYMENT_LABELS, PAYMENT_METHODS } from '../utils/posUtils';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

/** Detalle de una venta: ticket, cambio de método de pago y anulación (repone stock). */
export const SaleDetailModal: React.FC<{ order: Order; onClose: () => void }> = ({ order, onClose }) => {
  const { updateOrder, cancelOrder } = useAdmin();
  const { showToast } = useToast();
  const [method, setMethod] = useState<PaymentMethod>(order.paymentMethod);
  const [observacion, setObservacion] = useState(order.observacion ?? '');
  const [cancelReason, setCancelReason] = useState('');
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const isCancelled = order.status === 'anulada';

  const { handleBackdropClick } = useModalDismiss({ onClose, closeOnBackdrop: true });

  const handleSave = () => {
    updateOrder(order.id, { paymentMethod: method, observacion: observacion.trim() });
    showToast('Venta actualizada', 'success');
  };

  const handleCancel = () => {
    const reason = cancelReason.trim() || observacion.trim();
    if (!reason) {
      showToast('Por favor, ingresá el motivo de la anulación.', 'error');
      return;
    }
    cancelOrder(order.id, reason);
    showToast('Venta anulada y stock repuesto con éxito', 'success');
    setConfirmingCancel(false);
  };

  return (
    <>
      <div className="modal-overlay" onClick={handleBackdropClick}>
        <div className="modal-content" style={{ maxWidth: '520px', padding: 0 }}>
          <div className="sale-modal-header" style={{ padding: '1rem 1.25rem' }}>
            <h3><Receipt weight="fill" /> Ticket de Venta</h3>
            <ModalCloseButton onClick={onClose} />
          </div>

          <div style={{ padding: '1rem 1.25rem', background: 'var(--bg-color)' }}>
            <Ticket order={order} />
          </div>

          <div className="sale-modal-edit" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '1rem', padding: '1rem 1.25rem 0' }}>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ marginBottom: '0.3rem' }}>Método de pago</label>
              <select value={method} onChange={e => setMethod(e.target.value as PaymentMethod)} disabled={isCancelled} style={{ padding: '0.65rem 0.75rem' }}>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '0.75rem' }}>
              <label style={{ marginBottom: '0.3rem' }}>Observación</label>
              <input type="text" value={observacion} onChange={e => setObservacion(e.target.value)} placeholder="Ej: Pago parcial / Transfer..." disabled={isCancelled} style={{ padding: '0.65rem 0.75rem' }} />
            </div>
          </div>

          <div className="sale-modal-footer" style={{ padding: '1rem 1.25rem' }}>
            {confirmingCancel ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', textAlign: 'left' }}>
                <span className="sale-modal-warning" style={{ color: 'var(--danger)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Warning size={20} weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />
                  ¿Anular esta venta? Se devolverán los productos al stock.
                </span>
                <div>
                  <label htmlFor="cancel-reason-input" style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                    Motivo de la anulación *
                  </label>
                  <input
                    id="cancel-reason-input"
                    type="text"
                    autoFocus
                    value={cancelReason}
                    onChange={e => setCancelReason(e.target.value)}
                    placeholder="Ej: Devolución del cliente / Error de cobro / Producto fallado..."
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      fontSize: '0.9rem',
                      fontFamily: 'inherit'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
                  <button type="button" className="btn-secondary" onClick={() => { setConfirmingCancel(false); setCancelReason(''); }}>
                    Volver
                  </button>
                  <button type="button" className="btn-accent btn-danger" onClick={handleCancel}>
                    Confirmar Anulación
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn-icon" style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem' }} onClick={() => window.print()} title="Imprimir" aria-label="Imprimir ticket">
                  <Printer size={20} weight="bold" aria-hidden="true" />
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
