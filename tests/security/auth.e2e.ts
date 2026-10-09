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

test.describe('Security: Auth & Rate Limiting', () => {
  let client: ReturnType<typeof createClient>;

  test.beforeAll(() => {
    client = createClient({ baseUrl: insforgeUrl, anonKey: insforgeAnonKey });
  });

  test('API is vulnerable to brute force login (no server-side rate limit)', async () => {
    // Intentar login 10 veces rápido
    const attempts = Array(10).fill(0);
    let successCount = 0;
    let errorCount = 0;
    let rateLimitCount = 0;

    for (const _ of attempts) {
      const { data, error } = await client.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      if (error) {
        errorCount++;
        // InsForge/Supabase suele devolver 429 para rate limit
        if (error.status === 429 || error.message.includes('rate limit')) {
          rateLimitCount++;
        }
      } else {
        successCount++;
      }
    }

    // Queremos PROBAR que está roto. Es decir, que NO hay rate limiting por servidor.
    // Si rateLimitCount es 0, significa que la API permitió los 10 intentos seguidos.
    expect(rateLimitCount).toBeGreaterThan(0); // Esto fallará y mostrará la vulnerabilidad
  });
});
