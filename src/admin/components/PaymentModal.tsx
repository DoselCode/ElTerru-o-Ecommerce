import React, { useState } from 'react';
import type { OrderItem, PaymentMethod } from '../types';
import { TICKET_CONFIG } from '../utils/ticketConfig';
import { PAYMENT_LABELS, PAYMENT_METHODS, calculateTotals, formatMoney, getDiscountRate } from '../utils/posUtils';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface PaymentModalProps {
  items: OrderItem[];
  onCancel: () => void;
  onConfirm: (method: PaymentMethod, client: string) => void;
}

/** Modal de cobro: elige el método de pago y muestra el total con su descuento. */
export const PaymentModal: React.FC<PaymentModalProps> =({ items, onCancel, onConfirm }) => {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [client, setClient] = useState('');

  const { handleBackdropClick } = useModalDismiss({ onClose: onCancel, closeOnBackdrop: false });

  const { subtotal, total, descuento, neto, iva } = calculateTotals(items, method, TICKET_CONFIG.ivaRate);
  const discountPct = subtotal > 0 ? Math.round((descuento / subtotal) * 100) : 0;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-content wide card">
        <div className="sale-modal-header" style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 className="section-title" style={{ margin: 0 }}>Registrar Pago</h2>
          <ModalCloseButton onClick={onCancel} />
        </div>

        <div className="pay-summary">
          <p className="pay-label">Subtotal</p>
          <h3>{formatMoney(subtotal)}</h3>
          {descuento > 0 && (
            <span className="pay-discount">Descuento del {discountPct}% (-{formatMoney(descuento)})</span>
          )}
          <div className="pay-taxes">
            <div><span className="pay-label">Neto</span><div>{formatMoney(neto)}</div></div>
            <div><span className="pay-label">IVA ({Math.round(TICKET_CONFIG.ivaRate * 100)}%)</span><div>{formatMoney(iva)}</div></div>
          </div>
          <p className="pay-label" style={{ marginTop: '1rem' }}>Total Final a Cobrar</p>
          <h2 className="pay-total">{formatMoney(total)}</h2>
        </div>

        <label className="pay-label" style={{ display: 'block', marginBottom: '0.5rem' }}>Método de Pago</label>
        <div className="pay-methods">
          {PAYMENT_METHODS.map(m => (
            <button key={m} className={`pay-method${method === m ? ' selected' : ''}`} onClick={() => setMethod(m)}>
              {PAYMENT_LABELS[m]} ({getDiscountRate(m) > 0 ? `-${getDiscountRate(m) * 100}` : '0'}%)
            </button>
          ))}
        </div>

        <div className="form-group">
          <label>Cliente (Opcional)</label>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Consumidor Final" />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" onClick={onCancel}>Cancelar</button>
          <button className="btn-accent" onClick={() => onConfirm(method, client)}>Confirmar Cobro</button>
        </div>
      </div>
    </div>
  );
};
