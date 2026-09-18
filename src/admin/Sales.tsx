import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from './AdminContext';
import { Receipt, X } from '@phosphor-icons/react';
import { Order } from '../types/product';

export const Sales: React.FC = () => {
  const navigate = useNavigate();
  const { state } = useAdmin();
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Order | null>(null);
  
  const filteredOrders = state.orders.filter(o => {
    if (search && !o.client.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <section className="view-section active flex-col">
      <div className="section-header" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <h2 className="section-title">Ventas y Pedidos</h2>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <input 
            type="text" 
            className="filter-input"
            placeholder="Buscar cliente..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn-accent" style={{ padding: '0.65rem 1.5rem' }} onClick={() => navigate('/admin/pos')}>
            + Nueva Venta (Ir a POS)
          </button>
        </div>
      </div>

      <div className="card p-0" style={{ flex: 1, overflowY: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Método de Pago</th>
              <th>Total</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>No hay pedidos registrados</td></tr>
            ) : (
              filteredOrders.map(o => {
                let pagosHtml = [];
                if (o.paymentMethod) {
                  if (o.paymentMethod === 'efectivo') pagosHtml.push('Efectivo');
                  else if (o.paymentMethod === 'transferencia') pagosHtml.push('Transferencia');
                  else if (o.paymentMethod === 'tarjeta') pagosHtml.push('Tarjeta');
                } else {
                  if(o.paidEfectivo > 0) pagosHtml.push(`Efectivo`);
                  if(o.paidTransferencia > 0) pagosHtml.push(`Transferencia`);
                  if(o.paidTarjeta > 0) pagosHtml.push(`Tarjeta`);
                }
                const methodStr = pagosHtml.length > 0 ? pagosHtml.join(' / ') : 'Efectivo';

                return (
                  <tr key={o.id}>
                    <td>{o.date}</td>
                    <td><strong>{o.client}</strong></td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {methodStr}
                    </td>
                    <td><strong>${o.total.toLocaleString()}</strong></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className="btn-icon" style={{ color: 'var(--primary-color)' }} onClick={() => setSelectedTicket(o)} title="Ver Ticket">
                          <Receipt />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '0' }}>
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                <Receipt weight="fill" />
                Ticket de Venta
              </h3>
              <button className="btn-icon" style={{ color: 'var(--text-muted)' }} onClick={() => setSelectedTicket(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <img src="/logoterruno.png" alt="El Terruño" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', margin: '0 auto 1rem' }} />
                <h4 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>El Terruño</h4>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>Almacén Gourmet</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Fecha:</span>
                <strong>{selectedTicket.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cliente:</span>
                <strong>{selectedTicket.client}</strong>
              </div>

              <div style={{ borderTop: '1px dashed var(--border-color)', borderBottom: '1px dashed var(--border-color)', padding: '1rem 0', margin: '1.5rem 0' }}>
                {selectedTicket.items.map((item: any, idx: number) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                    <div style={{ flex: 1 }}>
                      <span style={{ display: 'block', fontWeight: 600 }}>{item.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.cartQty || 1} x ${item.price.toLocaleString()}</span>
                    </div>
                    <strong style={{ alignSelf: 'center' }}>${((item.cartQty || 1) * item.price).toLocaleString()}</strong>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <strong>${(selectedTicket.total + (selectedTicket.descuento || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              {(selectedTicket.descuento || 0) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Descuento:</span>
                  <strong style={{ color: 'var(--success)' }}>-${selectedTicket.descuento.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Neto:</span>
                <strong>${(selectedTicket.neto || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>IVA (21%):</span>
                <strong>${(selectedTicket.iva || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Total Final:</strong>
                <strong style={{ color: 'var(--primary-color)' }}>${selectedTicket.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>

              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>¡Muchas gracias por su compra! 🍷</p>
              </div>
            </div>
            
            <div style={{ background: '#f8fafc', padding: '1.5rem', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
              <button className="btn-secondary" style={{ width: '100%' }} onClick={() => setSelectedTicket(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Sales;
