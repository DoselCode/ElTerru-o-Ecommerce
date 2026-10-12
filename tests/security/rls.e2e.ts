import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { createClient } from '@insforge/sdk';
import * as fs from 'fs';
import * as path from 'path';

// Parsear .env.local a mano o usar dotenv (asumimos formato simple)
const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
envLocal.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const insforgeUrl = env.VITE_INSFORGE_URL;
const insforgeAnonKey = env.VITE_INSFORGE_ANON_KEY;

test.describe('Security: Row-Level Security', () => {
  let anonClient: ReturnType<typeof createClient>;

  test.beforeAll(() => {
    anonClient = createClient({ baseUrl: insforgeUrl, anonKey: insforgeAnonKey });
  });

  test('Anonymous user can read products but cannot insert', async () => {
    // Lectura debe funcionar
    const { data: products, error: readError } = await anonClient.database.from('products').select('*').limit(1);
    expect(readError).toBeNull();
    expect(Array.isArray(products)).toBe(true);

    // Escritura debe fallar por RLS (romper todo)
    const { data, error: insertError } = await anonClient.database.from('products').insert({
      name: 'Hacked Product',
      price: -100, // Stock negativo (Punto A)
      stock: -50,
      // Se omite category_id para no causar error de tipo 22P02 si espera UUID
    });

    // Si esto falla (la BD de InsForge lo permite y está mal), el test fallará y nos mostrará el problema.
    // Nosotros ESPERAMOS que haya un error de RLS, pero sabemos que RLS podría estar mal configurado.
    // De hecho, la instrucción dice "comprobar que no-admin y anon NO PUEDAN", así que testearemos que SÍ de error.
    expect(insertError).not.toBeNull();
    expect(insertError?.code).toBe('42501'); // 42501 es insufficient_privilege en Postgres
  });

  test('Anonymous user cannot call decrement_stock', async () => {
    const { data, error } = await anonClient.database.rpc('decrement_stock', {
      product_id: 1,
      qty: 1
    });

    // Como decrement_stock es SECURITY INVOKER, debería fallar si no tiene permisos.
    // O tal vez falla en silencio. Queremos asegurar que la BD NO permita esto en silencio.
    expect(error).not.toBeNull();
  });
});
