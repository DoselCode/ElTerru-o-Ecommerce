import { insforge } from '../lib/insforge';
import type { Order, OrderItem, PaymentMethod } from '../admin/types';

// Ventas anteriores a la columna payment_method solo guardan los montos por método
interface OrderRow {
  id: string;
  client: string;
  total: number | string;
  neto?: number | string | null;
  iva?: number | string | null;
  descuento?: number | string | null;
  payment_method?: PaymentMethod | null;
  paid_tarjeta?: number | string | null;
  paid_transferencia?: number | string | null;
  date: string;
  created_at?: string | null;
  ticket_number?: number | string | null;
  status: Order['status'];
  observacion?: string | null;
  items?: OrderItem[] | null;
}

const inferPaymentMethod = (row: OrderRow): PaymentMethod => {
  if (row.payment_method) return row.payment_method;
  if (Number(row.paid_tarjeta) > 0) return 'tarjeta';
  if (Number(row.paid_transferencia) > 0) return 'transferencia';
  return 'efectivo';
};

const mapOrder = (row: OrderRow): Order => ({
  id: row.id,
  client: row.client,
  total: Number(row.total),
  neto: Number(row.neto || 0),
  iva: Number(row.iva || 0),
  descuento: Number(row.descuento || 0),
  paymentMethod: inferPaymentMethod(row),
  date: row.date,
  createdAt: row.created_at || undefined,
  ticketNumber: row.ticket_number != null ? Number(row.ticket_number) : undefined,
  status: row.status,
  observacion: row.observacion || undefined,
  items: row.items || []
});

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapOrder);
  },

  createOrder: async (o: Order): Promise<void> => {
    const { error } = await insforge.database.from('orders').insert([{
      id: o.id, client: o.client, total: o.total,
      neto: o.neto, iva: o.iva, descuento: o.descuento,
      payment_method: o.paymentMethod,
      date: o.date, status: o.status, items: o.items,
      ticket_number: o.ticketNumber ?? null,
      observacion: o.observacion ?? null,
      // Conserva la hora real de las ventas sincronizadas offline
      ...(o.createdAt ? { created_at: o.createdAt } : {})
    }]);
    if (error) throw error;
  },

  updateOrder: async (id: string, updates: Partial<Pick<Order, 'paymentMethod' | 'status' | 'observacion'>>): Promise<void> => {
    const changes: Record<string, unknown> = {};
    if (updates.paymentMethod !== undefined) changes.payment_method = updates.paymentMethod;
    if (updates.status !== undefined) changes.status = updates.status;
    if (updates.observacion !== undefined) changes.observacion = updates.observacion;

    const { error } = await insforge.database.from('orders').update(changes).eq('id', id);
    if (error) throw error;
  }
};
