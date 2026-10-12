import { describe, it, expect, vi } from 'vitest';
import { productService, mapProduct } from '../productService';
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

  it('maps prices per payment method and falls back to the id as code', () => {
    const product = mapProduct({ id: 7, name: 'Salsa', category: 'DANKON', supplier: 'DANKON', price: '9100', price_efectivo: '8200', price_transferencia: null, stock: 3 });
    expect(product.code).toBe('0007');
    expect(product.priceEfectivo).toBe(8200);
    expect(product.priceTransferencia).toBeUndefined();
    expect(mapProduct({ id: 7, code: '0125', name: 'X', category: 'C', price: 1 }).code).toBe('0125');
  });
});
