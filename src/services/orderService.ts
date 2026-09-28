import { insforge } from '../lib/insforge';
import { Order } from '../admin/AdminContext';

export const orderService = {
  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await insforge.database
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((o: any) => ({
      id: o.id,
      client: o.client,
      total: Number(o.total),
      neto: Number(o.neto || 0),
      iva: Number(o.iva || 0),
      descuento: Number(o.descuento || 0),
      paidEfectivo: Number(o.paid_efectivo),
      paidTransferencia: Number(o.paid_transferencia),
      paidTarjeta: Number(o.paid_tarjeta),
      paymentMethod: o.payment_method,
      date: o.date,
      status: o.status,
      items: o.items || []
    }));
  },

  createOrder: async (o: Order): Promise<void> => {
    const { error } = await insforge.database.from('orders').insert([{
      id: o.id, client: o.client, total: o.total,
      neto: o.neto, iva: o.iva, descuento: o.descuento,
      paid_efectivo: o.paidEfectivo, paid_transferencia: o.paidTransferencia, paid_tarjeta: o.paidTarjeta,
      payment_method: o.paymentMethod,
      date: o.date, status: o.status, items: o.items
    }]);
    if (error) throw error;
  },

  updateOrder: async (id: string, updates: Partial<Order>): Promise<void> => {
    const { error } = await insforge.database.from('orders').update({
      paid_efectivo: updates.paidEfectivo,
      paid_transferencia: updates.paidTransferencia,
      paid_tarjeta: updates.paidTarjeta,
      status: updates.status
    }).eq('id', id);
    if (error) throw error;
  }
};
