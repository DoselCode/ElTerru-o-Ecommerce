import { insforge } from '../lib/insforge';
import { Product, ProductRow } from '../types/product';

const toNumberOrUndefined = (value: unknown) => (value ? Number(value) : undefined);

export const mapProduct = (row: ProductRow): Product => ({
  id: row.id.toString(),
  code: row.code || String(row.id).padStart(4, '0'),
  name: row.name,
  year: row.year,
  category: row.category,
  category_id: row.category_id,
  provider_id: row.provider_id,
  categories: row.categories,
  providers: row.providers,
  supplier: row.supplier || undefined,
  price: Number(row.price),
  priceEfectivo: toNumberOrUndefined(row.price_efectivo),
  priceTransferencia: toNumberOrUndefined(row.price_transferencia),
  originalPrice: toNumberOrUndefined(row.original_price),
  discountBadge: row.discount_badge,
  badge: row.badge,
  image: row.image ?? '',
  description: row.description ?? '',
  winery: row.winery,
  pairing: row.pairing,
  stock: row.stock || 0,
  isFeatured: row.is_featured,
  isVisible: row.is_visible,
});

export const productService = {
  getCategories: async () => {
    const { data, error } = await insforge.database.from('categories').select('*').order('name');
    if (error) throw error;
    return data || [];
  },
  getProviders: async () => {
    const { data, error } = await insforge.database.from('providers').select('*').order('name');
    if (error) throw error;
    return data || [];
  },
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*, categories(name), providers(name)')
      .order('id', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapProduct);
  },

  getProduct: async (id: string | number): Promise<ProductRow> => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*, categories(name), providers(name)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as ProductRow;
  },

  createProduct: async (payload: Record<string, unknown>): Promise<void> => {
    const { error } = await insforge.database.from('products').insert([payload]);
    if (error) throw error;
  },

  updateProduct: async (id: string | number, payload: Record<string, unknown>): Promise<void> => {
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

