import React, { useState } from 'react';
import type { OrderItem, PaymentMethod } from '../types';
import { TICKET_CONFIG } from '../utils/ticketConfig';
import { DEFAULT_DISCOUNT_RATES, DiscountRates, PAYMENT_LABELS, PAYMENT_METHODS, calculateTotals, formatDiscountPercent, formatMoney, getDiscountRate } from '../utils/posUtils';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';

interface PaymentModalProps {
  items: OrderItem[];
  onCancel: () => void;
  onConfirm: (method: PaymentMethod, client: string, applyDiscount: boolean) => void;
  isProcessing?: boolean;
  /** Descuentos vigentes; por defecto el 10% histórico. */
  rates?: DiscountRates;
}

/** Modal de cobro: elige el método de pago y muestra el total con su descuento. */
export const PaymentModal: React.FC<PaymentModalProps> = ({ items, onCancel, onConfirm, isProcessing, rates = DEFAULT_DISCOUNT_RATES }) => {
  const [method, setMethod] = useState<PaymentMethod>('efectivo');
  const [client, setClient] = useState('');
  const [noDiscount, setNoDiscount] = useState(false);

  const { handleBackdropClick } = useModalDismiss({ onClose: onCancel, closeOnBackdrop: false });

  const canSkipDiscount = getDiscountRate(method, rates) > 0;
  const applyDiscount = !(canSkipDiscount && noDiscount);
  const { subtotal, total, descuento, neto, iva } = calculateTotals(items, method, TICKET_CONFIG.ivaRate, applyDiscount, rates);
  // Solo se muestra cuando hay un descuento real (un descuento de centavos por redondeo no cuenta)
  const hasDiscount = descuento >= 0.5;

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
          {hasDiscount && (
            <span className="pay-discount">Descuento del {formatDiscountPercent(descuento, subtotal)} (-{formatMoney(descuento)})</span>
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
          {PAYMENT_METHODS.map(m => {
            const methodTotals = calculateTotals(items, m, TICKET_CONFIG.ivaRate, !(noDiscount && getDiscountRate(m, rates) > 0), rates);
            const pct = methodTotals.descuento >= 0.5 ? `-${formatDiscountPercent(methodTotals.descuento, methodTotals.subtotal)}` : '0%';
            return (
              <button key={m} className={`pay-method${method === m ? ' selected' : ''}`} onClick={() => setMethod(m)}>
                {PAYMENT_LABELS[m]} ({pct})
              </button>
            );
          })}
        </div>

        {canSkipDiscount && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.75rem 0', cursor: 'pointer' }}>
            <input type="checkbox" checked={noDiscount} onChange={e => setNoDiscount(e.target.checked)} />
            Cobrar sin descuento (precio de lista)
          </label>
        )}

        <div className="form-group">
          <label>Cliente (Opcional)</label>
          <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Consumidor Final" />
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button className="btn-secondary" disabled={isProcessing} onClick={onCancel}>Cancelar</button>
          <button className="btn-accent" disabled={isProcessing} onClick={() => onConfirm(method, client, applyDiscount)}>
            {isProcessing ? 'Procesando...' : 'Confirmar Cobro'}
          </button>
        </div>
      </div>
    </div>
  );
};
