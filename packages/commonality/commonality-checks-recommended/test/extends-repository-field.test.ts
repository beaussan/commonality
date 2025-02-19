import { extendsRepositoryField } from '../src/extends-repository-field';
import { createTestCheck, json } from 'commonality';
import { describe, it, expect, afterEach } from 'vitest';
import mockFs from 'mock-fs';

describe('extendsRepositoryField', () => {
  afterEach(() => {
    mockFs.restore();
  });

  describe('validate', () => {
    it('should return true if no repository is specified', async () => {
      mockFs({
        'package.json': JSON.stringify({}),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({}),
          },
        },
      });
      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(true);
    });

    it('should return false if the package does not extend the root repository field', async () => {
      mockFs({
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({}),
          },
        },
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(false);
    });

    it('should return true if the package does extend the root repository field', async () => {
      mockFs({
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({
              repository: 'https://github.com/npm/cli.git/packages/pkg-a',
            }),
          },
        },
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(true);
    });

    it('should return false if the package incorrectly extends the root repository field', async () => {
      mockFs({
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({
              repository: 'https://github.com/npm/cli.git/packages/pkg-ab',
            }),
          },
        },
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(false);
    });

    it('should return false if the package does not extend the root repository field when it is an object', async () => {
      mockFs({
        'package.json': JSON.stringify({
          repository: {
            type: 'git',
            url: 'https://github.com/npm/cli.git',
          },
        }),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({}),
          },
        },
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(false);
    });

    it('should return true if the package does extend the root repository field when it is an object', async () => {
      mockFs({
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({
              repository: {
                type: 'git',
                url: 'https://github.com/npm/cli.git/packages/pkg-a',
              },
            }),
          },
        },
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      const result = await conformer.validate();

      expect(result).toBe(true);
    });
  });

  describe('fix', () => {
    it('should return the correct config when the root repository is a string and the package repository does not exist', async () => {
      mockFs({
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({}),
          },
        },
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      await conformer.fix();

      const result = await json('./', './packages/pkg-a/package.json').get();

      expect(result).toEqual({
        repository: 'https://github.com/npm/cli.git/packages/pkg-a',
      });
    });

    it('should return the correct config when the root repository is an object and the package repository does not exist', async () => {
      mockFs({
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({}),
          },
        },
        'package.json': JSON.stringify({
          repository: { url: 'https://github.com/npm/cli.git', type: 'git' },
        }),
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      await conformer.fix();

      const result = await json('./', './packages/pkg-a/package.json').get();

      expect(result).toEqual({
        repository: 'https://github.com/npm/cli.git/packages/pkg-a',
      });
    });

    it('should return the correct config when the root repository is a malformed string and the package repository is an object', async () => {
      mockFs({
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({
              repository: {
                url: 'https://github.com/npwefwefwefm/cli.git',
                type: 'git',
              },
            }),
          },
        },
        'package.json': JSON.stringify({
          repository: 'https://github.com/npm/cli.git',
        }),
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      await conformer.fix();

      const result = await json('./', './packages/pkg-a/package.json').get();

      expect(result).toEqual({
        repository: {
          url: 'https://github.com/npm/cli.git/packages/pkg-a',
          type: 'git',
        },
      });
    });

    it('should return the correct config when the root repository is an object and the package repository is a string', async () => {
      mockFs({
        packages: {
          'pkg-a': {
            'package.json': JSON.stringify({
              repository: 'https://github.com/npwefwefwefm/cli.git',
            }),
          },
        },
        'package.json': JSON.stringify({
          repository: { url: 'https://github.com/npm/cli.git', type: 'git' },
        }),
      });

      const conformer = createTestCheck(extendsRepositoryField(), {
        workspace: {
          path: './packages/pkg-a',
          relativePath: './packages/pkg-a',
        },
        rootWorkspace: {
          path: './',
          relativePath: './',
        },
      });

      await conformer.fix();

      const result = await json('./', './packages/pkg-a/package.json').get();

      expect(result).toEqual({
        repository: 'https://github.com/npm/cli.git/packages/pkg-a',
      });
    });

    describe('message', () => {
      it('matches the expected snapshot when repository is missing from package', async () => {
        mockFs({
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({
                name: 'foo',
              }),
            },
          },
          'package.json': JSON.stringify({
            name: 'foo',
            repository: {
              type: 'git',
              url: 'https://github.com/npm/cli.git',
            },
          }),
        });

        const conformer = createTestCheck(extendsRepositoryField(), {
          workspace: {
            path: './packages/pkg-a',
            relativePath: './packages/pkg-a',
          },
          rootWorkspace: {
            path: './',
            relativePath: './',
          },
        });

        const result = await conformer.message();

        expect(result.title).toEqual(
          `Package's repository property must extend the repository property at the root of your project.`,
        );
        expect(result.filePath).toEqual('package.json');
        expect(result.suggestion).toMatchInlineSnapshot(`
          "  Object {
              \\"name\\": \\"foo\\",
          +   \\"repository\\": \\"https://github.com/npm/cli.git/packages/pkg-a\\",
            }"
        `);
      });

      it('matches the expected snapshot when repository exists in package', async () => {
        mockFs({
          packages: {
            'pkg-a': {
              'package.json': JSON.stringify({
                name: 'foo',
                repository: 'https://github.com/npm/cli.git/packages/pkg-a',
              }),
            },
          },
          'package.json': JSON.stringify({
            name: 'foo',
            repository: {
              type: 'git',
              url: 'https://github.com/npm/cli.git',
            },
          }),
        });

        const conformer = createTestCheck(extendsRepositoryField(), {
          workspace: {
            path: './packages/pkg-a',
            relativePath: './packages/pkg-a',
          },
          rootWorkspace: {
            path: './',
            relativePath: './',
          },
        });

        const result = await conformer.message();

        expect(result.title).toEqual(
          `Package's repository property must extend the repository property at the root of your project.`,
        );
        expect(result.filePath).toEqual('package.json');
        expect(result.suggestion).toMatchInlineSnapshot('undefined');
      });
    });
  });
});
