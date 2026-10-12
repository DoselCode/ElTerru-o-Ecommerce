import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Security: HTTP Headers (Vercel config)', () => {
  let vercelConfig: any;

  test.beforeAll(() => {
    const configPath = path.resolve(process.cwd(), 'vercel.json');
    vercelConfig = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  });

  test('vercel.json must include Strict-Transport-Security (HSTS)', () => {
    const globalHeaders = vercelConfig.headers.find((h: any) => h.source === '/(.*)');
    expect(globalHeaders).toBeDefined();

    const hsts = globalHeaders.headers.find((h: any) => h.key === 'Strict-Transport-Security');
    expect(hsts).toBeDefined();
    expect(hsts.value).toContain('max-age=');
    expect(hsts.value).toContain('includeSubDomains');
  });

  test('vercel.json must include CSP, X-Frame-Options, X-Content-Type-Options', () => {
    const globalHeaders = vercelConfig.headers.find((h: any) => h.source === '/(.*)');
    
    const csp = globalHeaders.headers.find((h: any) => h.key === 'Content-Security-Policy');
    expect(csp).toBeDefined();

    const xfo = globalHeaders.headers.find((h: any) => h.key === 'X-Frame-Options');
    expect(xfo).toBeDefined();
    expect(xfo.value).toBe('DENY');

    const nosniff = globalHeaders.headers.find((h: any) => h.key === 'X-Content-Type-Options');
    expect(nosniff).toBeDefined();
    expect(nosniff.value).toBe('nosniff');
  });
});
