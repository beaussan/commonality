import { afterEach, describe, expect, it } from 'vitest';
import { hasValidPackageName } from '../src/has-valid-package-name';
import { createTestCheck } from 'commonality';
import mockFs from 'mock-fs';

describe('hasValidPackageName', () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe('validate', () => {
    it('should return false if package name is not present', async () => {
      mockFs({
        'package.json': JSON.stringify({}),
      });
      const conformer = createTestCheck(hasValidPackageName());

      const result = await conformer.validate();

      expect(result).toBe(false);
    });

    it('should return true if package name is invalid', async () => {
      mockFs({
        'package.json': JSON.stringify({
          name: 'workspace-namE',
        }),
      });

      const conformer = createTestCheck(hasValidPackageName());

      const result = await conformer.validate();

      expect(result).toBe(false);
    });

    it('should return true if package name is present', async () => {
      mockFs({
        'package.json': JSON.stringify({
          name: 'workspace-name',
        }),
      });

      const conformer = createTestCheck(hasValidPackageName());

      const result = await conformer.validate();

      expect(result).toBe(true);
    });
  });
});
