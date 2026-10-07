import type { Product } from '../../types/product';
import type { Order, OrderItem, PaymentMethod, RegisterState } from '../types';

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  transferencia: 'Transferencia',
  credito: 'Tarjeta Crédito',
  debito: 'Tarjeta Débito',
};

export const PAYMENT_METHODS = Object.keys(PAYMENT_LABELS) as PaymentMethod[];

/** Descuento por método de pago: 10% efectivo, 5% transferencia. */
const DISCOUNT_RATES: Record<PaymentMethod, number> = {
  efectivo: 0.10,
  transferencia: 0.05,
  credito: 0,
  debito: 0,
};

export const getDiscountRate = (method: PaymentMethod) => DISCOUNT_RATES[method];

/** Precio de lista del catálogo (PSP) con el redondeo propio de cada método cuando está cargado. */
export const getUnitPrice = (product: Pick<Product, 'price' | 'priceEfectivo' | 'priceTransferencia'>, method: PaymentMethod) => {
  if (method === 'efectivo') return product.priceEfectivo ?? product.price * (1 - DISCOUNT_RATES.efectivo);
  if (method === 'transferencia') return product.priceTransferencia ?? product.price * (1 - DISCOUNT_RATES.transferencia);
  return product.price;
};

export const calculateTotals = (items: OrderItem[], method: PaymentMethod, ivaRate: number) => {
  const subtotal = items.reduce((acc, item) => acc + item.price * (item.cartQty || 1), 0);
  const total = items.reduce((acc, item) => acc + getUnitPrice(item, method) * (item.cartQty || 1), 0);
  const neto = total / (1 + ivaRate);
  return { subtotal, total, descuento: subtotal - total, neto, iva: total - neto };
};

export const formatMoney = (value: number) =>
  `$${(value || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const pad2 = (n: number) => String(n).padStart(2, '0');

export const padNumber = (n: number, length: number) => String(n).padStart(length, '0');

/** Fecha local YYYY-MM-DD; toISOString() la corre un día después de las 21 hs en Argentina. */
export const toLocalDateString = (d: Date) =>
  `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;

export const formatTicketDate = (order: Pick<Order, 'date' | 'createdAt'>) => {
  if (order.createdAt) {
    const d = new Date(order.createdAt);
    return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)}/${d.getFullYear()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }
  const [y, m, day] = order.date.split('-');
  return `${day}/${m}/${y}`;
};

export const formatOpening = (iso: string | null) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const weekday = d.toLocaleDateString('es-AR', { weekday: 'long' });
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${d.getDate()}, ${pad2(d.getHours())}:${pad2(d.getMinutes())} Hs`;
};

export const formatTime = (iso: string) => {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const getNextTicketNumber = (orders: Order[]) =>
  orders.reduce((max, o) => Math.max(max, o.ticketNumber || 0), 0) + 1;

export const sumByMethod = (orders: Order[]): Record<PaymentMethod, number> => {
  const totals: Record<PaymentMethod, number> = { efectivo: 0, transferencia: 0, credito: 0, debito: 0 };
  for (const o of orders) {
    if (o.status !== 'anulada') totals[o.paymentMethod] += o.total;
  }
  return totals;
};

/** Totales del turno de caja: solo cuenta ventas no anuladas posteriores a la apertura. */
export const getRegisterSummary =(reg: RegisterState, orders: Order[]) => {
  const openedAt = reg.openedAt ? new Date(reg.openedAt).getTime() : Infinity;
  const sessionOrders = orders.filter(o => o.status !== 'anulada' && o.createdAt && new Date(o.createdAt).getTime() >= openedAt);
  const ventas = sumByMethod(sessionOrders);
  const totalFacturado = PAYMENT_METHODS.reduce((acc, m) => acc + ventas[m], 0);
  const ingresos = reg.movimientos.filter(m => m.type === 'ingreso').reduce((acc, m) => acc + m.amount, 0);
  const egresos = reg.movimientos.filter(m => m.type === 'egreso').reduce((acc, m) => acc + m.amount, 0);

  return {
    sessionOrders,
    ventas,
    totalFacturado,
    ingresos,
    egresos,
    efectivoEnCajon: reg.efectivoInicial + ventas.efectivo + ingresos - egresos,
    totalEnCaja: reg.efectivoInicial + totalFacturado + ingresos - egresos,
    cantidadMovimientos: sessionOrders.length + reg.movimientos.length,
  };
};
