// @vitest-environment jsdom
import { beforeEach, describe, it, expect, vi } from 'vitest';
import { discountService } from '../discountService';
import { insforge } from '../../lib/insforge';

const single = vi.fn();
const updateEq = vi.fn();

vi.mock('../../lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn(() => ({ eq: vi.fn(() => ({ single })) })),
        update: vi.fn(() => ({ eq: updateEq })),
      })),
      rpc: vi.fn(),
    },
  },
}));

describe('discountService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('reads the stored percentages as rates and caches them for offline use', async () => {
    single.mockResolvedValue({ data: { discount_efectivo: 5, discount_transferencia: 8 }, error: null });
    const rates = await discountService.getDiscountRates();
    expect(rates).toEqual({ efectivo: 0.05, transferencia: 0.08, credito: 0, debito: 0 });
    expect(insforge.database.from).toHaveBeenCalledWith('store_info');

    single.mockResolvedValue({ data: null, error: new Error('offline') });
    expect(await discountService.getDiscountRates()).toEqual(rates);
  });

  it('falls back to the default 10% without cache or columns', async () => {
    single.mockResolvedValue({ data: null, error: new Error('column does not exist') });
    expect(await discountService.getDiscountRates()).toEqual({ efectivo: 0.10, transferencia: 0.10, credito: 0, debito: 0 });
  });

  it('saves percentages and rejects values outside 0-100', async () => {
    updateEq.mockResolvedValue({ error: null });
    await discountService.saveDiscountPercents({ efectivo: 5, transferencia: 10 });
    expect(updateEq).toHaveBeenCalledWith('id', 1);
    await expect(discountService.saveDiscountPercents({ efectivo: 120, transferencia: 10 })).rejects.toThrow('entre 0 y 100');
  });

  it('recalculates method prices through the RPC and returns the updated count', async () => {
    vi.mocked(insforge.database.rpc).mockResolvedValue({ data: 42, error: null } as never);
    expect(await discountService.recalculateMethodPrices('efectivo')).toBe(42);
    expect(insforge.database.rpc).toHaveBeenCalledWith('recalculate_method_prices', { method: 'efectivo' });
  });
});
