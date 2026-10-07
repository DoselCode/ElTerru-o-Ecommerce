import { useCallback, useEffect, useState } from 'react';
import { insforge } from '../lib/insforge';
import { mapProduct } from '../services/productService';
import type { Product, ProductRow, StoreInfo, StoreInfoRow } from '../types/product';

const mapStoreInfo = (row: StoreInfoRow): StoreInfo => ({
  name: row.name,
  tagline: row.tagline,
  logo: row.logo,
  phone: row.phone,
  whatsappNumber: row.whatsapp_number,
  email: row.email,
  address: row.address,
  hoursWeekdays: row.hours_weekdays,
  hoursSaturday: row.hours_saturday,
  hoursSunday: row.hours_sunday,
  heroBadge: row.hero_badge,
  heroTitle: row.hero_title,
  heroSubtitle: row.hero_subtitle,
  heroBgImage: row.hero_bg_image,
  aboutTitle: row.about_title,
  aboutQuote: row.about_quote,
  aboutQuoteAuthor: row.about_quote_author,
  aboutParagraph1: row.about_paragraph_1,
  aboutParagraph2: row.about_paragraph_2,
  aboutParagraph3: row.about_paragraph_3,
  aboutMainImage: row.about_main_image,
  aboutSubImage: row.about_sub_image,
  statYears: row.stat_years,
  statProducers: row.stat_producers,
  statProducts: row.stat_products,
  instagramUrl: row.instagram_url,
  showPhone: row.show_phone,
  showWhatsapp: row.show_whatsapp,
  showEmail: row.show_email,
  showAddress: row.show_address,
  showInstagram: row.show_instagram,
});

export interface StorefrontData {
  storeInfo: StoreInfo | null;
  products: Product[];
  featuredProduct: Product | null;
  loading: boolean;
  fetchError: string | null;
  refetch: () => Promise<void>;
}

export const useStorefrontData = (): StorefrontData => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [featuredProduct, setFeaturedProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const [storeResponse, productsResponse] = await Promise.all([
        insforge.database.from('store_info').select('*').eq('id', 1).single(),
        insforge.database.from('products').select('*').eq('is_visible', true).order('id', { ascending: false }),
      ]);

      if (storeResponse.error || productsResponse.error) throw storeResponse.error ?? productsResponse.error;

      if (storeResponse.data) setStoreInfo(mapStoreInfo(storeResponse.data as StoreInfoRow));

      if (productsResponse.data) {
        const mapped = (productsResponse.data as ProductRow[]).map(mapProduct);
        setProducts(mapped);
        setFeaturedProduct(mapped.find(p => p.isFeatured) || null);
      }
    } catch (err: unknown) {
      console.error('Error loading storefront:', err);
      setFetchError('Ocurrió un error al cargar la tienda. Intentá de nuevo más tarde.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { storeInfo, products, featuredProduct, loading, fetchError, refetch };
};
