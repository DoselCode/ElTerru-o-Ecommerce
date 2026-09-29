export type Category = 'Todos' | 'Vinos' | 'Almacén' | 'Fiambres' | 'Regalos';

export interface Product {
  id: string;
  code: string;
  name: string;
  year?: string;
  category: string;
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
