import { describe, it, expect } from 'vitest';
import { EMPTY_PRODUCT_FORM, productFormToPayload, validateProductForm, withAutoDiscountBadge, withMethodPricesFromRates } from '../productForm/productFormUtils';

const valid = { ...EMPTY_PRODUCT_FORM, name: 'Malbec', category_id: '1', price: '12000', description: 'Vino tinto', stock: '5' };

describe('productFormUtils', () => {
  it('accepts a complete form', () => {
    expect(validateProductForm(valid, true, false)).toEqual({});
  });

  it('requires an image and rejects a non numeric code', () => {
    const errors = validateProductForm({ ...valid, code: 'AB1' }, false, false);
    expect(errors.image).toBeDefined();
    expect(errors.code).toBeDefined();
  });

  it('rejects an original price lower than the price', () => {
    expect(validateProductForm({ ...valid, original_price: '10000' }, true, false).original_price).toBeDefined();
  });

  it('rejects cash and transfer prices above the list price', () => {
    const errors = validateProductForm({ ...valid, price_efectivo: '12500', price_transferencia: '12000' }, true, false);
    expect(errors.price_efectivo).toBeDefined();
    expect(errors.price_transferencia).toBeUndefined();
    expect(validateProductForm({ ...valid, price_efectivo: '11000' }, true, false)).toEqual({});
  });

  it('autocompletes the discount badge from the original price', () => {
    const next = { ...valid, original_price: '15000' };
    expect(withAutoDiscountBadge(valid, next, 'original_price').discount_badge).toBe('-20%');
  });

  it('builds a payload with nulls for empty optional fields', () => {
    const payload = productFormToPayload({ ...valid, price_efectivo: '11000' }, 'img.jpg');
    expect(payload).toMatchObject({
      code: null,
      supplier: null,
      category: 'Vinos',
      category_id: '1',
      price: 12000,
      price_efectivo: 11000,
      price_transferencia: null,
      image: 'img.jpg',
    });
  });

  describe('withMethodPricesFromRates', () => {
    const rates = { efectivo: 0.05, transferencia: 0.10, credito: 0, debito: 0 };

    it('fills cash and transfer prices from the list price, rounded to $100', () => {
      const next = withMethodPricesFromRates({ ...valid, price: '9400', price_efectivo: '8500', price_transferencia: '8900' }, rates);
      expect(next.price_efectivo).toBe('8900');
      expect(next.price_transferencia).toBe('8500');
      expect(next.price).toBe('9400');
    });

    it('never goes above the list price nor down to $0 for cheap products', () => {
      expect(withMethodPricesFromRates({ ...valid, price: '40' }, rates).price_efectivo).toBe('38');
      expect(withMethodPricesFromRates({ ...valid, price: '1000' }, { ...rates, efectivo: 0 }).price_efectivo).toBe('1000');
    });

    it('leaves the form unchanged without a valid list price', () => {
      const form = { ...valid, price: '', price_efectivo: '500' };
      expect(withMethodPricesFromRates(form, rates)).toBe(form);
    });
  });
});
