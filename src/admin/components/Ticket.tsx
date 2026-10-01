import React from 'react';
import type { Order } from '../types';
import { TICKET_CONFIG } from '../utils/ticketConfig';
import { PAYMENT_LABELS, formatMoney, formatTicketDate, padNumber } from '../utils/posUtils';

const Divider = () => <div className="tk-divider" />;

/** Ticket de venta con el formato de impresora térmica. Se usa en pantalla y para imprimir. */
export const Ticket: React.FC<{ order: Order }> = ({ order }) => {
  const method = order.paymentMethod;
  const descuento = order.descuento || 0;
  const subtotal = order.total + descuento;
  const discountPct = subtotal > 0 ? Math.round((descuento / subtotal) * 100) : 0;
  const unidades = order.items.reduce((acc, item) => acc + (item.cartQty || 1), 0);
  const isConsumidorFinal = !order.client || order.client === 'Consumidor Final';

  return (
    <div className="ticket-paper">
      <div className="tk-center tk-title">{TICKET_CONFIG.nombreFantasia}</div>
      <div>{TICKET_CONFIG.razonSocial}</div>
      <div>CUIT: {TICKET_CONFIG.cuit}</div>
      <div>{TICKET_CONFIG.direccion}</div>
      <div>{TICKET_CONFIG.condicionIva}</div>
      <div>{isConsumidorFinal ? 'A Consumidor Final' : `Cliente: ${order.client}`}</div>
      <Divider />
      {order.status === 'anulada' && <div className="tk-center tk-title">*** ANULADO ***</div>}
      <div className="tk-center">Ticket no válido como factura</div>
      <Divider />
      <div>Fecha: {formatTicketDate(order)}</div>
      <div className="tk-row">
        <span>T Nro: {order.ticketNumber ? padNumber(order.ticketNumber, 8) : '—'}</span>
        <span>P.V. N° {padNumber(TICKET_CONFIG.puntoVenta, 3)}</span>
      </div>
      <Divider />
      {order.items.map((item, idx) => {
        const qty = item.cartQty || 1;
        return (
          <div key={idx} className="tk-item">
            <div>{qty} x {formatMoney(item.price)}</div>
            <div className="tk-row">
              <span>{item.name}</span>
              <span>{formatMoney(qty * item.price)}</span>
            </div>
          </div>
        );
      })}
      <Divider />
      <div className="tk-row">
        <span>Subtotal</span>
        <span>{formatMoney(subtotal)}</span>
      </div>
      {descuento > 0 && (
        <div className="tk-row">
          <span>Desc. {PAYMENT_LABELS[method]} ({discountPct}%)</span>
          <span>-{formatMoney(descuento)}</span>
        </div>
      )}
      <div className="tk-row tk-total">
        <span>TOTAL</span>
        <span>{formatMoney(order.total)}</span>
      </div>
      <Divider />
      <div className="tk-row">
        <span>F. de Pago</span>
        <span>{PAYMENT_LABELS[method]}</span>
      </div>
      <Divider />
      <div className="tk-row">
        <span>Neto Gravado</span>
        <span>{formatMoney(order.neto || 0)}</span>
      </div>
      <div className="tk-row">
        <span>IVA {Math.round(TICKET_CONFIG.ivaRate * 100)}%</span>
        <span>{formatMoney(order.iva || 0)}</span>
      </div>
      <div>Régimen de Transparencia Fiscal Ley 27743</div>
      <div className="tk-row">
        <span>IVA Contenido</span>
        <span>{formatMoney(order.iva || 0)}</span>
      </div>
      <Divider />
      <div>Cant. de artículos: {unidades}</div>
      <div className="tk-center tk-footer">Gracias por su compra</div>
    </div>
  );
};

/** Copia oculta del ticket que solo aparece al imprimir (window.print). */
export const PrintableTicket: React.FC<{ order: Order }> = ({ order }) => (
  <div id="print-root" className="print-only">
    <Ticket order={order} />
  </div>
);

export default Ticket;
