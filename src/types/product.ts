export interface CategoryRow {
  id: string;
  name: string;
}

export interface ProviderRow {
  id: string;
  name: string;
}

export type Category = 'Todos' | 'Vinos' | 'Almacén' | 'Fiambres' | 'Regalos';

/** Fila cruda de `products` tal como viene de la BD (snake_case); `Product` es el modelo de la app. */
export interface ProductRow {
  id: number | string;
  code?: string | null;
  name: string;
  year?: string;
  category: string;
  category_id?: string;
  provider_id?: string;
  categories?: { name: string };
  providers?: { name: string };
  supplier?: string | null;
  price: number | string;
  price_efectivo?: number | string | null;
  price_transferencia?: number | string | null;
  original_price?: number | string | null;
  discount_badge?: string;
  badge?: string;
  image?: string;
  description?: string;
  winery?: string;
  pairing?: string;
  stock?: number | null;
  is_featured?: boolean;
  is_visible?: boolean;
}
export interface Product {
  id: string;
  code: string;
  name: string;
  year?: string;
  category: string;
  category_id?: string;
  provider_id?: string;
  categories?: { name: string };
  providers?: { name: string };
  supplier?: string;
  price: number;
  priceEfectivo?: number;
  priceTransferencia?: number;
  originalPrice?: number;
  discountBadge?: string;
  badge?: string;
  image: string;
  description: string;
  winery?: string;
  pairing?: string;
  stock: number;
  isFeatured?: boolean;
  isVisible?: boolean;
}

type StoreInfoTextColumn =
  | 'tagline' | 'logo' | 'phone' | 'whatsapp_number' | 'email' | 'address'
  | 'hours_weekdays' | 'hours_saturday' | 'hours_sunday'
  | 'hero_badge' | 'hero_title' | 'hero_subtitle' | 'hero_bg_image'
  | 'about_title' | 'about_quote' | 'about_quote_author'
  | 'about_paragraph_1' | 'about_paragraph_2' | 'about_paragraph_3'
  | 'about_main_image' | 'about_sub_image'
  | 'stat_years' | 'stat_producers' | 'stat_products' | 'instagram_url';

type StoreInfoFlagColumn = 'show_phone' | 'show_whatsapp' | 'show_email' | 'show_address' | 'show_instagram';

export type StoreInfoRow = { name: string } &
  Partial<Record<StoreInfoTextColumn, string>> &
  Partial<Record<StoreInfoFlagColumn, boolean>>;
export interface StoreInfo {
  name: string;
  tagline?: string;
  logo?: string;
  phone?: string;
  whatsappNumber?: string;
  email?: string;
  address?: string;
  hoursWeekdays?: string;
  hoursSaturday?: string;
  hoursSunday?: string;
  heroBadge?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroBgImage?: string;
  aboutTitle?: string;
  aboutQuote?: string;
  aboutQuoteAuthor?: string;
  aboutParagraph1?: string;
  aboutParagraph2?: string;
  aboutParagraph3?: string;
  aboutMainImage?: string;
  aboutSubImage?: string;
  statYears?: string;
  statProducers?: string;
  statProducts?: string;
  instagramUrl?: string;
  showPhone?: boolean;
  showWhatsapp?: boolean;
  showEmail?: boolean;
  showAddress?: boolean;
  showInstagram?: boolean;
}


