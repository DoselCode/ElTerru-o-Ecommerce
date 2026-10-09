import React, { useEffect, useRef, useState } from 'react';
import { CalendarBlank, Receipt } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { SaleDetailModal } from './SaleDetailModal';
import type { PaymentMethod } from '../types';
import { PAYMENT_LABELS, PAYMENT_METHODS, formatMoney, formatTicketDate, padNumber, toLocalDateString } from '../utils/posUtils';
import { Paginator, usePaginator } from '../Paginator';

const PAGE_SIZE = 20;

const maskDate = (raw: string) => {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};

/** dd/mm/yyyy → yyyy-mm-dd; devuelve '' si está incompleta o no es una fecha real. */
const parseDate = (text: string) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return '';
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  const valid = d.getFullYear() === Number(yyyy) && d.getMonth() === Number(mm) - 1 && d.getDate() === Number(dd);
  return valid ? `${yyyy}-${mm}-${dd}` : '';
};

/** Campo de fecha en formato dd/mm/yyyy; expone el valor como yyyy-mm-dd ('' mientras no sea válida). */
const DateInput: React.FC<{ value: string; onChange: (iso: string) => void; label: string }> = ({ value, onChange, label }) => {
  const [text, setText] = useState('');
  const pickerRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value === '') setText(prev => (parseDate(prev) ? '' : prev));
  }, [value]);

  const openPicker = () => {
    const picker = pickerRef.current;
    if (!picker) return;
    picker.value = value;
    if (typeof picker.showPicker === 'function') picker.showPicker();
    else picker.click();
  };

  const handlePicked = (iso: string) => {
    if (!iso) return;
    const [y, m, d] = iso.split('-');
    setText(`${d}/${m}/${y}`);
    onChange(iso);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <input
        type="text"
        inputMode="numeric"
        className="filter-input"
        style={{ width: '170px', paddingRight: '2.25rem' }}
        placeholder={`${label} dd/mm/aaaa`}
        aria-label={label}
        maxLength={10}
        value={text}
        onChange={(e) => {
          const next = maskDate(e.target.value);
          setText(next);
          onChange(parseDate(next));
        }}
      />
      <button
        type="button"
        className="btn-icon"
        style={{ position: 'absolute', right: '0.35rem', padding: '0.25rem' }}
        onClick={openPicker}
        title={`Elegir fecha (${label})`}
        aria-label={`Abrir calendario ${label}`}
      >
        <CalendarBlank size={18} />
      </button>
      <input
        ref={pickerRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(e) => handlePicked(e.target.value)}
        style={{ position: 'absolute', right: 0, bottom: 0, width: 0, height: 0, opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
};

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
    // Día local: slice del ISO (UTC) correría a mañana las ventas hechas después de las 21 hs
    const orderDay = o.createdAt ? toLocalDateString(new Date(o.createdAt)) : (o.date || '').slice(0, 10);
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
          <DateInput label="Desde" value={dateFrom} onChange={setDateFrom} />
          <DateInput label="Hasta" value={dateTo} onChange={setDateTo} />
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
