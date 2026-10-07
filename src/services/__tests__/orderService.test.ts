import { describe, it, expect, vi } from 'vitest';
import { orderService } from '../orderService';
import { insforge } from '../../lib/insforge';

const rows = [
  { id: 'a', client: 'X', total: '1000', payment_method: 'mercadopago', date: '2026-09-28', status: 'pagado', items: [] },
  { id: 'b', client: 'Y', total: '500', paid_tarjeta: '500', date: '2026-09-27', status: 'pagado', items: [] },
  { id: 'c', client: 'Z', total: '300', paid_efectivo: '300', date: '2026-09-27', status: 'pagado', items: [] },
];

vi.mock('../../lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: rows, error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    }
  }
}));

describe('orderService', () => {
  it('fetches orders and infers the payment method of legacy rows', async () => {
    const orders = await orderService.getOrders();
    expect(insforge.database.from).toHaveBeenCalledWith('orders');
    expect(orders.map(o => o.paymentMethod)).toEqual(['transferencia', 'debito', 'efectivo']);
    expect(orders[0].total).toBe(1000);
  });
});
