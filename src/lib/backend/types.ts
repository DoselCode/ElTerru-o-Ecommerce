import type { InsForgeClient } from '@insforge/sdk';

export type BackendProvider = 'insforge' | 'supabase';

/** Usuario autenticado, independiente del proveedor de backend. */
export interface BackendUser {
  id: string;
  email?: string | null;
}

/** Autenticación: el subconjunto que usa la app, con la misma forma en ambos proveedores. */
export interface BackendAuth {
  signInWithPassword(credentials: { email: string; password: string }): Promise<{ error: Error | null }>;
  signOut(): Promise<{ error: Error | null }>;
  /** Sin sesión devuelve `user: null` sin error. */
  getCurrentUser(): Promise<{ data: { user: BackendUser | null }; error: Error | null }>;
  /** Devuelve la función para desuscribirse. */
  onAuthStateChange(callback: () => void): () => void;
}

/**
 * Base de datos y storage: ambos SDK exponen la misma API (query builder de PostgREST y
 * buckets con `upload`/`getPublicUrl`), así que se toma la firma de InsForge como contrato.
 */
export type BackendDatabase = Pick<InsForgeClient['database'], 'from' | 'rpc'>;
export type BackendStorage = Pick<InsForgeClient['storage'], 'from'>;

export interface Backend {
  provider: BackendProvider;
  database: BackendDatabase;
  auth: BackendAuth;
  storage: BackendStorage;
}
