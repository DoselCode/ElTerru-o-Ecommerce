import React, { useState } from 'react';
import { Receipt } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { SaleDetailModal } from './SaleDetailModal';
import type { PaymentMethod } from '../types';
import { PAYMENT_LABELS, PAYMENT_METHODS, formatMoney, formatTicketDate, padNumber } from '../utils/posUtils';
import { Paginator, usePaginator } from '../Paginator';

const PAGE_SIZE = 20;

/** Historial de ventas con filtros (texto, método de pago, fechas) y acceso al detalle del ticket. */
export const Sales: React.FC = () => {
  const { state } = useAdmin();
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'todos'>('todos');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredOrders = state.orders.filter(o => {
    if (methodFilter !== 'todos' && o.paymentMethod !== methodFilter) return false;
    const orderDay = (o.createdAt || o.date || '').slice(0, 10);
    if (dateFrom && (!orderDay || orderDay < dateFrom)) return false;
    if (dateTo && (!orderDay || orderDay > dateTo)) return false;
    if (!search) return true;
    const q = search.toLowerCase();
    const matchesTicket = o.ticketNumber !== undefined && String(o.ticketNumber).includes(q.replace(/^0+/, ''));
    return o.client.toLowerCase().includes(q) || matchesTicket;
  });

  const { page, totalPages, setPage, slice: pageOrders } = usePaginator(filteredOrders, PAGE_SIZE);

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
          <input
            type="date"
            className="filter-input"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => setDateFrom(e.target.value)}
            aria-label="Desde"
          />
          <input
            type="date"
            className="filter-input"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            aria-label="Hasta"
          />
          {(dateFrom || dateTo) && (
            <button className="btn-secondary" style={{ padding: '0.65rem 1rem' }} onClick={() => { setDateFrom(''); setDateTo(''); }}>
              Limpiar fechas
            </button>
          )}
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
            {pageOrders.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No hay ventas para este filtro</td></tr>
            ) : (
              pageOrders.map(o => (
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
      <Paginator page={page} totalPages={totalPages} onPageChange={setPage} />

      {selectedOrder && <SaleDetailModal order={selectedOrder} onClose={() => setSelectedId(null)} />}
    </section>
  );
};

export default Sales;
