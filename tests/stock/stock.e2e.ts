import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import { createClient } from '@insforge/sdk';
import * as fs from 'fs';
import * as path from 'path';

const envLocal = fs.readFileSync(path.resolve(process.cwd(), '.env.local'), 'utf-8');
const env: Record<string, string> = {};
envLocal.split('\n').forEach(line => {
  const [k, v] = line.split('=');
  if (k && v) env[k.trim()] = v.trim();
});

const insforgeUrl = env.VITE_INSFORGE_URL;
const insforgeAnonKey = env.VITE_INSFORGE_ANON_KEY;

test.describe('Stock: Flujo completo de inventario y POS', () => {
  let adminClient: ReturnType<typeof createClient>;
  let testProductId: number;

  test.beforeAll(async () => {
    adminClient = createClient({ baseUrl: insforgeUrl, anonKey: insforgeAnonKey });
    
    // Necesitamos loguearnos como admin. Reemplazar con credenciales reales o usar un token.
    // Como esto es un test E2E en dev, creamos el cliente y lo autenticamos.
    // ATENCIÓN: En la prueba real, se asume que E2E_ADMIN_EMAIL y E2E_ADMIN_PASSWORD están en .env.local
    const email = env.E2E_ADMIN_EMAIL;
    const password = env.E2E_ADMIN_PASSWORD;
    
    if (email && password) {
      await adminClient.auth.signInWithPassword({ email, password });
    } else {
      // Si no hay credenciales, el test fallará si RLS nos bloquea (lo cual es correcto).
    }
  });

  test.afterEach(async () => {
    if (testProductId) {
      await adminClient.database.from('products').delete().eq('id', testProductId);
    }
  });

  test('El administrador puede crear, descontar y reponer stock por API', async () => {
    // 1. Crear producto
    const { data: inserted, error: insertError } = await adminClient.database
      .from('products')
      .insert({
        name: 'E2E-TEST Product',
        price: 5000,
        stock: 10
      })
      .select()
      .single();
      
    // Validar que el admin SÍ pudo insertar
    expect(insertError).toBeNull();
    expect(inserted).toBeDefined();
    testProductId = inserted.id;

    // 2. Vender 1 por POS (simular llamada a decrement_stock con qty=1)
    const { error: decError } = await adminClient.database.rpc('decrement_stock', {
      product_id: testProductId,
      qty: 1
    });
    expect(decError).toBeNull();

    // 3. Verificar el descuento
    const { data: updated1 } = await adminClient.database
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();
    expect(updated1?.stock).toBe(9);

    // 4. Anular la venta (simular llamada a decrement_stock con qty=-1)
    const { error: incError } = await adminClient.database.rpc('decrement_stock', {
      product_id: testProductId,
      qty: -1
    });
    expect(incError).toBeNull();

    // 5. Verificar la reposición
    const { data: updated2 } = await adminClient.database
      .from('products')
      .select('stock')
      .eq('id', testProductId)
      .single();
    expect(updated2?.stock).toBe(10);
  });
});
