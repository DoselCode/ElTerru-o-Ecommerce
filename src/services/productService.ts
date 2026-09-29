import { insforge } from '../lib/insforge';
import { Product } from '../types/product';

const toNumberOrUndefined = (value: unknown) => (value ? Number(value) : undefined);

export const mapProduct = (row: any): Product => ({
  id: row.id.toString(),
  code: row.code || String(row.id).padStart(4, '0'),
  name: row.name,
  year: row.year,
  category: row.category,
  supplier: row.supplier || undefined,
  price: Number(row.price),
  priceEfectivo: toNumberOrUndefined(row.price_efectivo),
  priceTransferencia: toNumberOrUndefined(row.price_transferencia),
  originalPrice: toNumberOrUndefined(row.original_price),
  discountBadge: row.discount_badge,
  badge: row.badge,
  image: row.image,
  description: row.description,
  winery: row.winery,
  pairing: row.pairing,
  stock: row.stock || 0,
  isFeatured: row.is_featured,
  isVisible: row.is_visible,
});

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  getProduct: async (id: string | number): Promise<any> => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  createProduct: async (payload: Record<string, any>): Promise<void> => {
    const { error } = await insforge.database.from('products').insert([payload]);
    if (error) throw error;
  },

  updateProduct: async (id: string | number, payload: Record<string, any>): Promise<void> => {
    const { error } = await insforge.database.from('products').update(payload).eq('id', Number(id));
    if (error) throw error;
  },

  deleteProduct: async (id: string | number): Promise<void> => {
    const { error } = await insforge.database.from('products').delete().eq('id', Number(id));
    if (error) throw error;
  },

  // Una cantidad negativa repone stock (anulación de ventas)
  decrementStock: async (id: string | number, qty: number): Promise<void> => {
    const { error } = await insforge.database.rpc('decrement_stock', { product_id: Number(id), qty });
    if (error) throw error;
  }
};
