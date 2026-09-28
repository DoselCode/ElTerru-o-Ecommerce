import { describe, it, expect, vi } from 'vitest';
import { orderService } from '../orderService';
import { insforge } from '../../lib/insforge';

vi.mock('../../lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockResolvedValue({ error: null }),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ error: null })
      }))
    }
  }
}));

describe('orderService', () => {
  it('should fetch orders', async () => {
    const orders = await orderService.getOrders();
    expect(orders).toBeDefined();
    expect(insforge.database.from).toHaveBeenCalledWith('orders');
  });
});
