export interface Product {
  id: string;
  name: string;
  year?: string;
  category: string;
  price: number;
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
