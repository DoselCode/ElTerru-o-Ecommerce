import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { SaleDetailModal } from './SaleDetailModal';
import type { PaymentMethod } from '../types';
import { PAYMENT_LABELS, PAYMENT_METHODS, formatMoney, formatTicketDate, padNumber } from '../utils/posUtils';

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAdmin();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'todos'>('todos');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredOrders = state.orders.filter(o => {
    if (methodFilter !== 'todos' && o.paymentMethod !== methodFilter) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const matchesTicket = o.ticketNumber !== undefined && String(o.ticketNumber).includes(q.replace(/^0+/, ''));
    return o.client.toLowerCase().includes(q) || matchesTicket;
  });

  const activeOrders = filteredOrders.filter(o => o.status !== 'anulada');
  const filteredTotal = activeOrders.reduce((acc, o) => acc + o.total, 0);
  const selectedOrder = state.orders.find(o => o.id === selectedId) ?? null;

  return (
    <section className="view-section active flex-col">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Ventas y Pedidos</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label htmlFor="sales-search" className="sr-only">Buscar ventas</label>
          <input
            id="sales-search"
            type="text"
            className="filter-input"
            placeholder="Buscar cliente o N° ticket..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="filter-input"
            style={{ minWidth: '190px' }}
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'todos')}
            aria-label="Filtrar por método de pago"
          >
            <option value="todos">Todos los métodos</option>
            {PAYMENT_METHODS.map(m => <option key={m} value={m}>{PAYMENT_LABELS[m]}</option>)}
          </select>
          <button className="btn-accent" style={{ padding: '0.65rem 1.5rem' }} onClick={() => navigate('/admin/pos')}>
            + Nueva Venta (Ir a POS)
          </button>
        </div>
      </div>

      <div className="sales-summary">
        <span><strong>{activeOrders.length}</strong> ventas</span>
        <span>Total: <strong className="text-primary">{formatMoney(filteredTotal)}</strong></span>
      </div>

      <div className="card p-0" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas para este filtro</td></tr>
            ) : (
              filteredOrders.map(o => (
                <tr key={o.id} className={o.status === 'anulada' ? 'row-cancelled' : ''}>
                  <td style={{ fontFamily: 'monospace' }}>{o.ticketNumber ? padNumber(o.ticketNumber, 8) : '—'}</td>
                  <td>{formatTicketDate(o)}</td>
                  <td><strong>{o.client}</strong></td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {PAYMENT_LABELS[o.paymentMethod]}
                    {o.status === 'anulada' && <span className="badge danger" style={{ marginLeft: '0.5rem' }}>Anulada</span>}
                  </td>
                  <td><strong>{formatMoney(o.total)}</strong></td>
                  <td>
                    <button className="btn-icon" style={{ color: 'var(--primary-color)' }} onClick={() => setSelectedId(o.id)} title="Ver Ticket" aria-label="Ver ticket">
                      <Receipt />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && <SaleDetailModal order={selectedOrder} onClose={() => setSelectedId(null)} />}
    </section>
  );
};

export default Sales;
