import { createClient } from '@insforge/sdk';
import type { Backend } from './types';

/** Backend de desarrollo: el SDK de InsForge ya cumple el contrato tal cual. */
export const createInsforgeBackend = (baseUrl: string, anonKey: string): Backend => {
  const client = createClient({ baseUrl, anonKey });
  return {
    provider: 'insforge',
    database: client.database,
    auth: client.auth,
    storage: client.storage,
  };
};
