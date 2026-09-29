import type { Product } from '../types/product';

export type PaymentMethod = 'efectivo' | 'transferencia' | 'tarjeta' | 'mercadopago';

export interface OrderItem extends Product {
  cartQty?: number;
}

export interface Order {
  id: string;
  client: string;
  total: number;
  neto: number;
  iva: number;
  descuento: number;
  paymentMethod: PaymentMethod;
  date: string;
  createdAt?: string;
  ticketNumber?: number;
  status: 'pagado' | 'anulada';
  observacion?: string;
  items: OrderItem[];
}

export interface RegisterMovement {
  id: string;
  type: 'ingreso' | 'egreso';
  amount: number;
  reason: string;
  createdAt: string;
}

export interface RegisterState {
  status: 'abierta' | 'cerrada';
  efectivoInicial: number;
  openedAt: string | null;
  numero: number;
  saldoProxima: number;
  movimientos: RegisterMovement[];
}

export const EMPTY_REGISTER: RegisterState = {
  status: 'cerrada', efectivoInicial: 0, openedAt: null, numero: 0, saldoProxima: 0, movimientos: []
};

export interface AdminState {
  products: Product[];
  orders: Order[];
  register: RegisterState;
}
