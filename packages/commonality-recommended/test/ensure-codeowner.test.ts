import { describe, expect, it } from 'vitest';
import { ensureCodeowner } from '../src/ensure-codeowner';
import { createTestCheck } from 'commonality';

describe('ensureCodeowner', () => {
  describe('validate', () => {
    it('should return false if codeowners are not present', async () => {
      const conformer = createTestCheck(ensureCodeowner(), {
        codeowners: [],
      });

      const result = await conformer.validate();
      expect(result).toBe(false);
    });

    it('should return true if codeowners are present', async () => {
      const conformer = createTestCheck(ensureCodeowner(), {
        codeowners: ['owner-1', 'owner-2'],
      });

      const result = await conformer.validate();

      expect(result).toBe(true);
    });
  });
});
