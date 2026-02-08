import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getGitDiff } from '../index.js';
import { execSync } from 'child_process';

vi.mock('child_process', () => ({
  execSync: vi.fn()
}));

describe('Git', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('getGitDiff', () => {
    it('debería retornar el diff de git staged', () => {
      const mockDiff = `diff --git a/src/file.ts b/src/file.ts
index 123456..789abc 100644
--- a/src/file.ts
+++ b/src/file.ts
@@ -1,5 +1,5 @@
 function test() {
-  return 1;
+  return 2;
 }`;

      vi.mocked(execSync).mockReturnValue(mockDiff);

      const result = getGitDiff();

      expect(result).toBe(mockDiff);
      expect(execSync).toHaveBeenCalledWith('git diff --staged', { encoding: 'utf8' });
    });

    it('debería retornar string vacío cuando no hay cambios staged', () => {
      vi.mocked(execSync).mockReturnValue('');

      const result = getGitDiff();

      expect(result).toBe('');
    });

    it('debería lanzar error cuando falla el comando git', () => {
      vi.mocked(execSync).mockImplementation(() => {
        throw new Error('fatal: not a git repository');
      });

      expect(() => getGitDiff()).toThrow('Failed to read git diff. Are you in a git repo?');
    });

    it('debería manejar diffs grandes', () => {
      const largeDiff = 'diff content\n'.repeat(1000);
      vi.mocked(execSync).mockReturnValue(largeDiff);

      const result = getGitDiff();

      expect(result).toBe(largeDiff);
    });
  });
});
