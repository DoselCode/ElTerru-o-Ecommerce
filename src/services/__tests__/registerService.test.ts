import { describe, it, expect, vi } from 'vitest';
import { registerService } from '../registerService';
import { insforge } from '../../lib/insforge';

vi.mock('../../lib/insforge', () => ({
  insforge: {
    database: {
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        upsert: vi.fn().mockResolvedValue({ error: null })
      }))
    }
  }
}));

describe('registerService', () => {
  it('should fetch register', async () => {
    const reg = await registerService.getGlobalRegister();
    expect(reg.status).toBe('cerrada');
  });
});
