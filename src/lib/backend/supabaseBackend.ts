import { createClient, isAuthSessionMissingError } from '@supabase/supabase-js';
import type { Backend, BackendDatabase, BackendStorage } from './types';

/** Backend de producción: adapta las pocas diferencias de supabase-js al contrato común. */
export const createSupabaseBackend = (url: string, anonKey: string): Backend => {
  const client = createClient(url, anonKey);

  return {
    provider: 'supabase',
    // Misma API de PostgREST y de storage que InsForge; el cast solo une los tipos nominales de cada SDK.
    database: client as unknown as BackendDatabase,
    storage: client.storage as unknown as BackendStorage,
    auth: {
      signInWithPassword: (credentials) => client.auth.signInWithPassword(credentials),
      signOut: () => client.auth.signOut(),
      getCurrentUser: async () => {
        const { data, error } = await client.auth.getUser();
        // Sin sesión no es un error para la app: el usuario es anónimo.
        if (error && isAuthSessionMissingError(error)) return { data: { user: null }, error: null };
        const user = data.user ? { id: data.user.id, email: data.user.email } : null;
        return { data: { user }, error };
      },
      onAuthStateChange: (callback) => {
        // Se difiere: llamar a otros métodos de auth dentro de este callback puede bloquear supabase-js.
        const { data } = client.auth.onAuthStateChange(() => {
          setTimeout(callback, 0);
        });
        return () => data.subscription.unsubscribe();
      },
    },
  };
};
