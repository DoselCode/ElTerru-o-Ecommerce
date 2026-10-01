const fs = require('fs');
const { execSync } = require('child_process');

const products = JSON.parse(fs.readFileSync('parsed_products.json', 'utf8'));

// Fetch existing products
const out = execSync(`npx @insforge/cli db query "SELECT id, code FROM products" --json`).toString();
// Wait, @insforge/cli doesn't have a reliable JSON output for query, let's just parse the ASCII table or do it properly.
