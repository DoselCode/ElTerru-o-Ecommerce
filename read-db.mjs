// Uso: node --env-file=.env read-db.mjs
import { createClient } from '@insforge/sdk';

const { VITE_INSFORGE_URL: baseUrl, INSFORGE_API_KEY: apiKey } = process.env;
if (!baseUrl || !apiKey) {
  console.error('Faltan VITE_INSFORGE_URL o INSFORGE_API_KEY en el entorno (.env).');
  process.exit(1);
}

const client = createClient({ baseUrl, anonKey: apiKey });

async function run() {
  const { data, error } = await client.database.from('products').select('*').limit(2);
  if (error) console.error('Error fetching products:', error);
  else console.log('Products:', JSON.stringify(data, null, 2));
}

run();
