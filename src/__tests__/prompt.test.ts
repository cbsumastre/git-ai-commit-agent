import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildPrompt } from '../index.js';

describe('Prompt', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('buildPrompt', () => {
    it('debería construir prompt con diff pequeño', () => {
      const diff = 'diff --git a/test.ts b/test.ts\n+console.log("test")';
      
      const prompt = buildPrompt(diff);

      expect(prompt).toContain('You are a senior software engineer');
      expect(prompt).toContain('Generate 3 different concise');
      expect(prompt).toContain(diff);
      expect(prompt).toContain('conventional commit prefixes');
      expect(prompt).toContain('feat:');
      expect(prompt).toContain('chore:');
      expect(prompt).toContain('doc:');
      expect(prompt).toContain('refactor:');
    });

    it('debería truncar diffs que exceden el límite de caracteres', () => {
      const largeDiff = 'a'.repeat(9000);
      
      const prompt = buildPrompt(largeDiff);

      expect(prompt).toContain('[diff truncated due to maximum size exceeded]');
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('exceeds the limit')
      );
    });

    it('debería incluir instrucciones de formato correctas', () => {
      const diff = 'small diff';
      
      const prompt = buildPrompt(diff);

      expect(prompt).toContain('Return exactly 3 commit messages');
      expect(prompt).toContain('one per line, numbered 1-3');
      expect(prompt).toContain('1. First commit message option');
      expect(prompt).toContain('2. Second commit message option');
      expect(prompt).toContain('3. Third commit message option');
    });

    it('debería incluir el diff truncado en el prompt', () => {
      const diff = 'line1\nline2\nline3';
      
      const prompt = buildPrompt(diff);

      expect(prompt).toContain(diff);
    });

    it('no debería truncar cuando el diff está justo en el límite', () => {
      const diff = 'a'.repeat(8000);
      
      const prompt = buildPrompt(diff);

      expect(prompt).not.toContain('[diff truncated');
    });
  });
});
