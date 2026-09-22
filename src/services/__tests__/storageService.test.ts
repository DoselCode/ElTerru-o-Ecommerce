import { describe, it, expect, vi } from 'vitest';
import { storageService } from '../storageService';
import { insforge } from '../../lib/insforge';

vi.mock('../../lib/insforge', () => ({
  insforge: {
    auth: {
      getCurrentUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test' } } })
    },
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://test' } })
      }))
    }
  }
}));

describe('storageService', () => {
  it('should upload image', async () => {
    const file = new File([''], 'test.png');
    const url = await storageService.uploadProductImage(file);
    expect(url).toBe('https://test');
  });
});
