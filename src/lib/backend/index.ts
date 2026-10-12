import { createInsforgeBackend } from './insforgeBackend';
import { createSupabaseBackend } from './supabaseBackend';
import type { Backend } from './types';

export type { Backend, BackendUser, BackendProvider } from './types';

/**
 * El proveedor se elige por las variables de entorno presentes:
 * 1. Si VITE_BACKEND_PROVIDER está definido ('supabase' | 'insforge'), se prioriza esa elección.
 * 2. Si solo están definidas las variables de uno, se usa ese proveedor.
 * 3. Si están definidas ambas:
 *    - En desarrollo (import.meta.env.DEV), se prioriza InsForge (dev = InsForge).
 *    - En producción, si están ambas y no hay VITE_BACKEND_PROVIDER, se lanza error para evitar ambigüedades.
 */
const selectBackend = (): Backend => {
  const env = import.meta.env;
  const preferred = env.VITE_BACKEND_PROVIDER?.toLowerCase();
  const supabaseUrl = env.VITE_SUPABASE_URL;
  const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
  const insforgeUrl = env.VITE_INSFORGE_URL;
  const insforgeAnonKey = env.VITE_INSFORGE_ANON_KEY;

  const hasSupabase = Boolean(supabaseUrl && supabaseAnonKey);
  const hasInsforge = Boolean(insforgeUrl && insforgeAnonKey);

  if (preferred === 'supabase') {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('VITE_BACKEND_PROVIDER=supabase pero faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY.');
    }
    return createSupabaseBackend(supabaseUrl, supabaseAnonKey);
  }

  if (preferred === 'insforge') {
    if (!insforgeUrl || !insforgeAnonKey) {
      throw new Error('VITE_BACKEND_PROVIDER=insforge pero faltan VITE_INSFORGE_URL o VITE_INSFORGE_ANON_KEY.');
    }
    return createInsforgeBackend(insforgeUrl, insforgeAnonKey);
  }

  if (hasSupabase && hasInsforge) {
    if (import.meta.env.DEV) {
      return createInsforgeBackend(insforgeUrl!, insforgeAnonKey!);
    }
    throw new Error('Hay variables de Supabase y de InsForge a la vez en producción. Definí solo las del entorno que corresponde o especificá VITE_BACKEND_PROVIDER.');
  }

  if (supabaseUrl && supabaseAnonKey) return createSupabaseBackend(supabaseUrl, supabaseAnonKey);
  if (insforgeUrl && insforgeAnonKey) return createInsforgeBackend(insforgeUrl, insforgeAnonKey);

  throw new Error('Faltan las variables de entorno del backend: VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY o VITE_INSFORGE_URL/VITE_INSFORGE_ANON_KEY.');
};

/** Cliente único de backend (BD, auth y storage) para toda la app. */
export const backend: Backend = selectBackend();
