import { insforge } from '../lib/insforge';
import { Product } from '../types/product';

export const productService = {
  getProducts: async (): Promise<Product[]> => {
    const { data, error } = await insforge.database
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;
    return (data || []).map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
      year: item.year,
      category: item.category,
      price: Number(item.price),
      originalPrice: item.original_price ? Number(item.original_price) : undefined,
      discountBadge: item.discount_badge,
      badge: item.badge,
      image: item.image,
      description: item.description,
      winery: item.winery,
      pairing: item.pairing,
      stock: item.stock || 0,
      isFeatured: item.is_featured,
      isVisible: item.is_visible,
    }));
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

  createProduct: async (product: Partial<Product>): Promise<Product> => {
    const { data, error } = await insforge.database.from('products').insert([{
      name: product.name,
      category: product.category,
      price: product.price,
      stock: product.stock,
      image: product.image,
      description: product.description,
      is_visible: product.isVisible,
    }]).select().single();
    
    if (error) throw error;
    return {
      id: data.id.toString(),
      name: data.name,
      category: data.category,
      price: Number(data.price),
      stock: data.stock,
      image: data.image,
      description: data.description,
      isVisible: data.is_visible
    } as Product;
  },

  createProductRaw: async (payload: any): Promise<void> => {
    const { error } = await insforge.database.from('products').insert([payload]);
    if (error) throw error;
  },

  updateProductRaw: async (id: string | number, payload: any): Promise<void> => {
    const { error } = await insforge.database.from('products').update(payload).eq('id', id);
    if (error) throw error;
  },

  updateProduct: async (id: string | number, dbUpdates: Record<string, any>): Promise<void> => {
    const { error } = await insforge.database.from('products').update(dbUpdates).eq('id', Number(id));
    if (error) throw error;
  },

  deleteProduct: async (id: string | number): Promise<void> => {
    const { error } = await insforge.database.from('products').delete().eq('id', Number(id));
    if (error) throw error;
  },

  decrementStock: async (id: string | number, qty: number): Promise<void> => {
    const { error } = await insforge.database.rpc('decrement_stock', { product_id: Number(id), qty });
    if (error) throw error;
  },

  getTotalMermas: async (): Promise<number> => {
    const { data, error } = await insforge.database.rpc('get_total_mermas');
    if (error) throw error;
    return data || 0;
  },

  addMerma: async (qty: number): Promise<void> => {
    const { error } = await insforge.database.from('mermas').insert([{ qty }]);
    if (error) throw error;
  }
};
