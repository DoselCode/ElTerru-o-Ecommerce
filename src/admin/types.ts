import { Product, StoreInfo } from '../types/product';

/**
 * Contrato de Tipos para el Módulo B: Dashboard Administrador (Panel Privado)
 * Esta estructura sirve de base para la futura integración con el Backend REST / GraphQL / Firebase.
 */

export interface AdminUser {
  id: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'MANAGER';
}

export interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export interface ProductFormData extends Omit<Product, 'id'> {
  id?: number;
}

export interface AdminCatalogOperations {
  createProduct: (product: ProductFormData) => Promise<Product>;
  updateProduct: (id: number, product: Partial<ProductFormData>) => Promise<Product>;
  toggleProductVisibility: (id: number) => Promise<boolean>;
  deleteProduct: (id: number) => Promise<boolean>;
  setFeaturedProduct: (id: number) => Promise<void>;
  updateStoreInfo: (info: Partial<StoreInfo>) => Promise<StoreInfo>;
}
