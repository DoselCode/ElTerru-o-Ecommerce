import React, { useState } from 'react';
import { useAdmin } from './AdminContext';
import { Flower, Leaf, Gift, Package, ShoppingCart, X, Wine, Drop, Cheese, Basket, Cookie } from '@phosphor-icons/react';

export const POS: React.FC = () => {
  const { state, cart, addToCart, removeFromCart, createOrder, clearCart, showToast } = useAdmin();
  const [search, setSearch] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Payment State
  const subtotal = cart.reduce((acc, item) => acc + (item.price * (item.cartQty || 1)), 0);
  const [paymentMethod, setPaymentMethod] = useState<'efectivo'|'transferencia'|'tarjeta'>('efectivo');
  const [client, setClient] = useState('');

  // Modifiers
  const getDiscountRate = (method: string) => {
    if (method === 'efectivo') return 0.10; // 10% discount
    if (method === 'transferencia') return 0.05; // 5% discount 
    if (method === 'tarjeta') return 0; // 0%
    return 0;
  };

  const discountRate = getDiscountRate(paymentMethod);
  const descuento = subtotal * discountRate;
  const total = subtotal - descuento;
  const neto = total / 1.21;
  const iva = total - neto;

  const openPayment = () => {
    setPaymentMethod('efectivo');
    setClient('');
    setShowPaymentModal(true);
  };

  const getIcon = (name: string, category: string) => {
    const lowerName = name?.toLowerCase() || '';
    const lowerCat = category?.toLowerCase() || '';

    if (lowerName.includes('vino') || lowerName.includes('malbec') || lowerName.includes('cabernet') || lowerName.includes('chardonnay') || lowerCat.includes('vino')) {
      return <Wine weight="fill" />;
    }
    if (lowerName.includes('aceite') || lowerName.includes('aceto') || lowerName.includes('vinagre') || lowerName.includes('oliva')) {
      return <Drop weight="fill" />;
    }
    if (lowerName.includes('queso') || lowerName.includes('provoleta')) {
      return <Cheese weight="fill" />;
    }
    if (lowerName.includes('fiambre') || lowerName.includes('picada') || lowerName.includes('salame') || lowerName.includes('jamón')) {
      return <Basket weight="fill" />;
    }
    if (lowerName.includes('mermelada') || lowerName.includes('pasta') || lowerName.includes('dulce') || lowerName.includes('miel')) {
      return <Cookie weight="fill" />;
    }
    if (lowerName.includes('regalo') || lowerName.includes('combo') || lowerName.includes('box') || lowerCat.includes('regalo')) {
      return <Gift weight="fill" />;
    }
    if (lowerCat.includes('almacén') || lowerCat.includes('almacen')) {
      return <Leaf weight="fill" />;
    }
    return <Package weight="fill" />;
  };

  const [lastOrder, setLastOrder] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePayment = () => {
    const reg = state.register;
    if (!reg || reg.status !== 'abierta') {
      showToast('No puedes cobrar, la caja está cerrada.', 'error');
      setShowPaymentModal(false);
      return;
    }

    const newOrder = {
      id: crypto.randomUUID(),
      client: client || 'Consumidor Final',
      total: total,
      neto: neto,
      iva: iva,
      descuento: descuento,
      paidEfectivo: paymentMethod === 'efectivo' ? total : 0,
      paidTransferencia: paymentMethod === 'transferencia' ? total : 0,
      paidTarjeta: paymentMethod === 'tarjeta' ? total : 0,
      date: new Date().toISOString().split('T')[0],
      status: 'pagado' as 'pagado',
      items: [...cart],
      paymentMethod // Keep it for printing purposes
    };

    createOrder(newOrder);
    setLastOrder(newOrder);
    clearCart();
    setShowPaymentModal(false);
    setShowSuccessModal(true);
  };

  const filteredProducts = state.products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <section className="view-section active flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <h2 className="section-title">Punto de Venta</h2>
      <div className="pos-layout">
        <div className="pos-left">
          <input 
            type="text" 
            className="pos-search" 
            placeholder="Buscar vinos, almacén, regalos..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="pos-products-grid">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className={`product-card${p.stock <= 0 ? ' opacity-50' : ''}`}
                style={{ cursor: p.stock <= 0 ? 'not-allowed' : 'pointer' }}
                onClick={() => p.stock > 0 && addToCart(p)}
              >
                {getIcon(p.name, p.category)}
                <div className="p-name">{p.name}</div>
                <div className="p-stock">Stock: {p.stock}</div>
                <div className="p-price">${p.price.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pos-right">
          <div className="pos-ticket">
            <div className="pos-ticket-header">
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: 'var(--text-main)' }}>
                <ShoppingCart weight="fill" />
                Ticket Actual
              </h3>
            </div>
            <div className="pos-ticket-items">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '2rem' }}>
                  <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                  <p>Aún no hay productos<br/>en el carrito</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="ticket-item">
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: 'block', fontSize: '0.9rem' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {item.cartQty || 1} x ${item.price.toLocaleString()}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>${((item.cartQty || 1) * item.price).toLocaleString()}</strong>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => removeFromCart(item.id)}>
                        <X />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pos-ticket-footer">
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '1.25rem' }}>
                <strong style={{ color: 'var(--text-main)' }}>Total Aprox:</strong>
                <strong style={{ color: 'var(--primary-color)' }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
              </div>
              <button className="btn-accent" style={{ width: '100%', padding: '1rem' }} disabled={cart.length === 0} onClick={openPayment}>
                Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal-content wide card">
            <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Registrar Pago</h2>
            <div>
              <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700 }}>Subtotal</p>
                <h3 style={{ color: 'var(--text-main)', fontSize: '1.5rem' }}>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                
                {discountRate > 0 && (
                  <div style={{ marginTop: '0.5rem' }}>
                    <span style={{ background: '#e6ffed', color: 'var(--success)', padding: '0.25rem 0.75rem', borderRadius: '999px', fontSize: '0.875rem', fontWeight: 600 }}>
                      Descuento del {discountRate * 100}% (-${descuento.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '1rem', color: 'var(--text-muted)' }}>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>Neto</span>
                    <div style={{ fontWeight: 600 }}>${neto.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', fontWeight: 700 }}>IVA (21%)</span>
                    <div style={{ fontWeight: 600 }}>${iva.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                  </div>
                </div>
                
                <p style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', fontWeight: 700, marginTop: '1rem' }}>Total Final a Cobrar</p>
                <h2 style={{ color: 'var(--primary-color)', fontSize: '2.5rem' }}>${total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h2>
              </div>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Método de Pago</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setPaymentMethod('efectivo')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: `2px solid ${paymentMethod === 'efectivo' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: paymentMethod === 'efectivo' ? 'rgba(85,99,61,0.05)' : 'white', fontWeight: 600, color: paymentMethod === 'efectivo' ? 'var(--primary-color)' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Efectivo (-10%)
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('transferencia')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: `2px solid ${paymentMethod === 'transferencia' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: paymentMethod === 'transferencia' ? 'rgba(85,99,61,0.05)' : 'white', fontWeight: 600, color: paymentMethod === 'transferencia' ? 'var(--primary-color)' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Transferencia (-5%)
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('tarjeta')}
                    style={{ padding: '0.75rem', borderRadius: '8px', border: `2px solid ${paymentMethod === 'tarjeta' ? 'var(--primary-color)' : 'var(--border-color)'}`, background: paymentMethod === 'tarjeta' ? 'rgba(85,99,61,0.05)' : 'white', fontWeight: 600, color: paymentMethod === 'tarjeta' ? 'var(--primary-color)' : 'var(--text-main)', cursor: 'pointer', transition: 'all 0.2s' }}
                  >
                    Tarjeta (0%)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Cliente (Opcional)</label>
                <input type="text" value={client} onChange={e => setClient(e.target.value)} placeholder="Consumidor Final" />
              </div>
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button className="btn-secondary" onClick={() => setShowPaymentModal(false)}>Cancelar</button>
              <button className="btn-accent" onClick={handlePayment}>Confirmar Cobro</button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ textAlign: 'center' }}>
            <div style={{ background: '#e6ffed', color: 'var(--success)', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <span style={{ fontSize: '2rem' }}>✓</span>
            </div>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Venta Registrada</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>El cobro se ha procesado exitosamente.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowSuccessModal(false)}>Cerrar</button>
              <button className="btn-accent" onClick={() => {
                window.print();
                // We keep it open so they can close it after printing, or we can close it
              }}>
                🖨️ Imprimir Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden layout purely for printing the ticket */}
      {lastOrder && (
        <div id="print-root" className="print-only">
          <div className="print-center print-bold" style={{ fontSize: '16px', marginBottom: '5px' }}>EL TERRUÑO</div>
          <div className="print-center" style={{ marginBottom: '15px' }}>Almacén Gourmet</div>
          
          <div className="print-flex">
            <span>Fecha:</span>
            <span>{lastOrder.date}</span>
          </div>
          <div className="print-flex" style={{ marginBottom: '10px' }}>
            <span>Cliente:</span>
            <span>{lastOrder.client}</span>
          </div>
          <div className="print-flex" style={{ marginBottom: '10px' }}>
            <span>Método de Pago:</span>
            <span style={{ textTransform: 'capitalize' }}>{lastOrder.paymentMethod || 'Efectivo'}</span>
          </div>

          <div className="print-divider"></div>
          
          <div className="print-bold print-flex" style={{ marginBottom: '5px' }}>
            <span style={{ flex: 2 }}>Producto</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Cant</span>
            <span style={{ flex: 1, textAlign: 'right' }}>Total</span>
          </div>
          
          {lastOrder.items.map((item: any, idx: number) => (
            <div key={idx} className="print-flex" style={{ marginBottom: '3px' }}>
              <span style={{ flex: 2 }}>{item.name}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>{item.cartQty || 1}</span>
              <span style={{ flex: 1, textAlign: 'right' }}>${((item.cartQty || 1) * item.price).toLocaleString()}</span>
            </div>
          ))}

          <div className="print-divider"></div>
          
          <div className="print-flex" style={{ fontSize: '12px', marginTop: '5px' }}>
            <span>Subtotal:</span>
            <span>${(lastOrder.total + (lastOrder.descuento || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {lastOrder.descuento > 0 && (
            <div className="print-flex" style={{ fontSize: '12px' }}>
              <span>Descuento:</span>
              <span>-${lastOrder.descuento.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="print-flex" style={{ fontSize: '12px' }}>
            <span>Neto:</span>
            <span>${(lastOrder.neto || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          <div className="print-flex" style={{ fontSize: '12px' }}>
            <span>IVA (21%):</span>
            <span>${(lastOrder.iva || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="print-flex print-bold" style={{ fontSize: '14px', marginTop: '10px' }}>
            <span>TOTAL FINAL:</span>
            <span>${lastOrder.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>

          <div className="print-center" style={{ marginTop: '20px', fontSize: '10px' }}>
            ¡Muchas gracias por tu compra!
          </div>
        </div>
      )}
    </section>
  );
};

export default POS;
