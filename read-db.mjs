import { createClient } from '@insforge/sdk';

const client = createClient({
  baseUrl: 'https://hd468uje.us-east.insforge.app',
  anonKey: 'ik_1d45652df2fad6b05b111dffc63f2950'
});

async function run() {
  const { data, error } = await client.from('products').select('*').limit(2);
  if (error) console.error('Error fetching products:', error);
  else console.log('Products:', JSON.stringify(data, null, 2));
}

run();
