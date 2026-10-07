import { describe, it, expect } from 'vitest';
import { EMPTY_PRODUCT_FORM, productFormToPayload, validateProductForm, withAutoDiscountBadge } from '../productForm/productFormUtils';

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

  it('autocompletes the discount badge from the original price', () => {
    const next = { ...valid, original_price: '15000' };
    expect(withAutoDiscountBadge(valid, next, 'original_price').discount_badge).toBe('-20%');
  });

  it('builds a payload with nulls for empty optional fields', () => {
    const payload = productFormToPayload({ ...valid, price_efectivo: '11000' }, 'img.jpg');
    expect(payload).toMatchObject({ code: null, supplier: null, price: 12000, price_efectivo: 11000, price_transferencia: null, image: 'img.jpg' });
  });
});
