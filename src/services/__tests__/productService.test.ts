import { describe, it, expect, vi } from 'vitest';
import { productService } from '../productService';
import { insforge } from '../../lib/insforge';

vi.mock('../../lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        order: vi.fn().mockResolvedValue({ data: [], error: null }),
        insert: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: {}, error: null }),
        single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      })),
      rpc: vi.fn().mockResolvedValue({ data: 0, error: null })
    }
  }
}));

describe('productService', () => {
  it('should fetch products', async () => {
    const products = await productService.getProducts();
    expect(products).toBeDefined();
    expect(insforge.database.from).toHaveBeenCalledWith('products');
  });
});
