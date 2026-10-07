const fs = require('fs');
const lines = fs.readFileSync('import_data.csv', 'utf-8').split('\n').filter(l => l.trim());
const products = new Map();
for (const line of lines) {
  const parts = line.split(';');
  if (parts.length < 5) continue;
  const code = parts[0].trim();
  const name = parts[1].trim();
  const provider = parts[2].trim();
  const price = parseFloat(parts[4].replace('.', '').replace(',', '.'));
  if (code && name && !isNaN(price) && code !== 'CÓDIGO' && code !== '0101') {
    products.set(code, { code, name, provider, price });
  }
  // also add 0101 because we skipped it above? wait, 0101 is a real code.
  if (code === '0101') products.set(code, { code, name, provider, price });
}
const pList = Array.from(products.values());
fs.writeFileSync('parsed_products.json', JSON.stringify(pList, null, 2));
console.log(`Parsed ${pList.length} unique products.`);
