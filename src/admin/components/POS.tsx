import React, { useMemo, useState } from 'react';
import { ShoppingCart, X } from '@phosphor-icons/react';
import { useAdmin } from '../context/AdminContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { PaymentModal } from './PaymentModal';
import { ModalCloseButton } from './ModalCloseButton';
import { useModalDismiss } from '../hooks/useModalDismiss';
import { PrintableTicket } from './Ticket';
import { getProductIcon } from '../utils/productIcon';
import { TICKET_CONFIG } from '../utils/ticketConfig';
import type { Order, PaymentMethod } from '../types';
import type { Product } from '../../types/product';
import { calculateTotals, formatMoney, getNextTicketNumber, padNumber, toLocalDateString } from '../utils/posUtils';

/** Punto de venta: catálogo con filtros, carrito, cobro (PaymentModal) y emisión del ticket. */
export const POS: React.FC = () => {
  const { state, createOrder, updateProduct } = useAdmin();
  const { cart, addToCart, removeFromCart, clearCart } = useCart();
  const { showToast } = useToast();
  const [search, setSearch] = useState('');
  const [supplier, setSupplier] = useState('');
  const [category, setCategory] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { handleBackdropClick } = useModalDismiss({ onClose: () => setShowSuccessModal(false), closeOnBackdrop: true });

  const categories = useMemo(
    () => [...new Set(state.products.map(p => p.categories?.name).filter(Boolean))].sort() as string[],
    [state.products]
  );

  const suppliers = useMemo(
    () => [...new Set(state.products.map(p => p.providers?.name).filter(Boolean))].sort() as string[],
    [state.products]
  );

  const query = search.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return state.products.filter(p => {
      if (category && p.categories?.name !== category) return false;
      if (supplier && p.providers?.name !== supplier) return false;
      if (!query) return true;
      return p.code.includes(query) || p.name.toLowerCase().includes(query) || (p.categories?.name || '').toLowerCase().includes(query) || (p.providers?.name || '').toLowerCase().includes(query);
    });
  }, [state.products, category, supplier, query]);

  const subtotal = cart.reduce((acc, item) => acc + item.price * (item.cartQty || 1), 0);

  const getQtyInCart = (id: string) => cart.find(i => i.id === id)?.cartQty ?? 0;

  const tryAddToCart = (p: Product) => {
    if (p.stock <= 0) {
      showToast(`"${p.name}" está agotado y no se puede agregar al carrito.`, 'error');
      return;
    }
    if (getQtyInCart(p.id) >= p.stock) {
      showToast(`Stock insuficiente. Solo hay ${p.stock} unidad${p.stock !== 1 ? 'es' : ''} disponible${p.stock !== 1 ? 's' : ''} de "${p.name}".`, 'warning');
      return;
    }
    addToCart(p);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !query) return;
    const byCode = state.products.find(p => p.code === query.padStart(4, '0'));
    const match = byCode ?? (filteredProducts.length === 1 ? filteredProducts[0] : undefined);
    if (!match) {
      showToast('No se encontró el producto.', 'error');
      return;
    }
    tryAddToCart(match);
    setSearch('');
  };

  const handlePayment = async (paymentMethod: PaymentMethod, client: string) => {
    if (isProcessing) return;
    if (state.register.status !== 'abierta') {
      showToast('No puedes cobrar, la caja está cerrada.', 'error');
      setShowPaymentModal(false);
      return;
    }

    setIsProcessing(true);
    try {
      const now = new Date();
      const { total, descuento, neto, iva } = calculateTotals(cart, paymentMethod, TICKET_CONFIG.ivaRate);
      const order: Order = {
        id: crypto.randomUUID(),
        ticketNumber: getNextTicketNumber(state.orders),
        client: client || 'Consumidor Final',
        total, neto, iva, descuento,
        paymentMethod,
        date: toLocalDateString(now),
        createdAt: now.toISOString(),
        status: 'pagado',
        items: [...cart],
      };

      await createOrder(order);

      // Descontar stock de cada producto vendido
      const stockUpdates = cart.map(item => {
        const product = state.products.find(p => p.id === item.id);
        if (!product) return Promise.resolve();
        const newStock = Math.max(0, product.stock - (item.cartQty || 1));
        return updateProduct(item.id, { stock: newStock });
      });

      await Promise.allSettled(stockUpdates);

      setLastOrder(order);
      clearCart();
      setShowPaymentModal(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      showToast('Error al procesar la venta. Intente nuevamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="view-section active flex-col" style={{ height: '100%', overflow: 'hidden' }}>
      <h2 className="section-title">Punto de Venta</h2>
      <div className="pos-layout">
        <div className="pos-left">
          <div className="pos-filters">
            <label htmlFor="pos-search" className="sr-only">Buscar productos</label>
            <input
              id="pos-search"
              type="text"
              className="pos-search"
              placeholder="Buscar por código, nombre, categoría o proveedor (Enter agrega)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              autoFocus
            />
            <select className="pos-supplier" value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filtrar por categoría">
                <option value="">Todas las categorías</option>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="pos-supplier" value={supplier} onChange={(e) => setSupplier(e.target.value)} aria-label="Filtrar por proveedor">
              <option value="">Todos los proveedores</option>
              {suppliers.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="pos-products-grid">
            {filteredProducts.map(p => (
              <div
                key={p.id}
                className={`product-card${p.stock <= 0 ? ' opacity-50' : ''}`}
                style={{ cursor: p.stock <= 0 ? 'not-allowed' : 'pointer' }}
                onClick={() => tryAddToCart(p)}
              >
                {getProductIcon(p.name, p.category)}
                <div className="p-code">{p.code}</div>
                <div className="p-name">{p.name}</div>
                <div className="p-stock">Stock: {p.stock}</div>
                <div className="p-price">{formatMoney(p.price)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="pos-right">
          <div className="pos-ticket">
            <div className="pos-ticket-header">
              <h3 className="pos-ticket-title"><ShoppingCart weight="fill" /> Ticket Actual</h3>
            </div>
            <div className="pos-ticket-items">
              {cart.length === 0 ? (
                <div className="pos-empty">
                  <ShoppingCart size={48} />
                  <p>Aún no hay productos<br />en el carrito</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="ticket-item">
                    <div style={{ flex: 1 }}>
                      <strong className="ticket-item-name">{item.name}</strong>
                      <span className="ticket-item-detail">{item.cartQty || 1} x {formatMoney(item.price)}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '0.9rem' }}>{formatMoney((item.cartQty || 1) * item.price)}</strong>
                      <button className="btn-icon" style={{ color: 'var(--danger)' }} onClick={() => removeFromCart(item.id)} aria-label={`Quitar ${item.name}`}>
                        <X />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="pos-ticket-footer">
              <div className="pos-total-row">
                <strong>Total (precio de lista)</strong>
                <strong className="pos-total">{formatMoney(subtotal)}</strong>
              </div>
              <button className="btn-accent" style={{ width: '100%', padding: '1rem' }} disabled={cart.length === 0} onClick={() => setShowPaymentModal(true)}>
                Cobrar
              </button>
            </div>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <PaymentModal items={cart} onCancel={() => !isProcessing && setShowPaymentModal(false)} onConfirm={handlePayment} isProcessing={isProcessing} />
      )}

      {showSuccessModal && lastOrder && (
        <div className="modal-overlay" onClick={handleBackdropClick}>
          <div className="modal-content card" style={{ textAlign: "center", position: "relative" }}>
            <ModalCloseButton onClick={() => setShowSuccessModal(false)} />
            <div className="success-check">✓</div>
            <h2 className="section-title" style={{ marginBottom: '0.5rem' }}>Venta Registrada</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
              Ticket N° {lastOrder.ticketNumber ? padNumber(lastOrder.ticketNumber, 8) : '—'} · {formatMoney(lastOrder.total)}
            </p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={() => setShowSuccessModal(false)}>Cerrar</button>
              <button className="btn-accent" onClick={() => window.print()}>🖨️ Imprimir Ticket</button>
            </div>
          </div>
        </div>
      )}

      {lastOrder && <PrintableTicket order={lastOrder} />}
    </section>
  );
};

export default POS;





