import { test } from '@e2e-dev/web';
import { expect } from 'e2e';
import * as fs from 'fs';
import * as path from 'path';

test.describe('Security: Static code analysis', () => {
  test('Env example no contiene claves reales', () => {
    const envExamplePath = path.resolve(process.cwd(), '.env.example');
    if (!fs.existsSync(envExamplePath)) return;
    
    const content = fs.readFileSync(envExamplePath, 'utf-8');
    // Verifica que no haya un token JWT real de Supabase (empiezan con eyJ)
    expect(content).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
  });

  // Si quisiéramos escanear dist/, podríamos hacerlo aquí después del build.
});
