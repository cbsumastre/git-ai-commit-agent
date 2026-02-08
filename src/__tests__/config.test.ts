import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getConfig, validateConfig, Config } from '../index.js';

describe('Config', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(process, 'exit').mockImplementation((code?: number | string | null) => {
      throw new Error(`Process exited with code: ${code}`);
    });
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('getConfig', () => {
    it('debería retornar configuración vacía cuando no hay variables de entorno', () => {
      delete process.env.GIT_AI_COMMIT_PROVIDER;
      delete process.env.GIT_AI_COMMIT_MODEL;

      const config = getConfig();

      expect(config).toEqual({
        provider: undefined,
        model: undefined
      });
    });

    it('debería retornar configuración con provider direct', () => {
      process.env.GIT_AI_COMMIT_PROVIDER = 'direct';
      process.env.GIT_AI_COMMIT_MODEL = 'gpt-4';

      const config = getConfig();

      expect(config).toEqual({
        provider: 'direct',
        model: 'gpt-4'
      });
    });

    it('debería retornar configuración con provider bedrock', () => {
      process.env.GIT_AI_COMMIT_PROVIDER = 'bedrock';
      process.env.GIT_AI_COMMIT_MODEL = 'anthropic.claude-3-sonnet';

      const config = getConfig();

      expect(config).toEqual({
        provider: 'bedrock',
        model: 'anthropic.claude-3-sonnet'
      });
    });
  });

  describe('validateConfig', () => {
    it('debería pasar validación para provider bedrock con modelo', () => {
      const config: Config = {
        provider: 'bedrock',
        model: 'anthropic.claude-3-sonnet'
      };

      expect(() => validateConfig(config)).not.toThrow();
    });

    it('debería lanzar error cuando falta el modelo', () => {
      const config: Config = {
        provider: 'direct',
        model: undefined
      };

      expect(() => validateConfig(config)).toThrow('Process exited with code: 1');
      expect(console.error).toHaveBeenCalledWith(
        'Missing required environment variables: GIT_AI_COMMIT_MODEL'
      );
    });

    it('debería lanzar error para provider direct cuando falta LLM_ENDPOINT', () => {
      delete process.env.LLM_ENDPOINT;
      process.env.LLM_API_KEY = 'test-key';
      
      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };

      expect(() => validateConfig(config)).toThrow('Process exited with code: 1');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('LLM_ENDPOINT')
      );
    });

    it('debería lanzar error para provider direct cuando falta LLM_API_KEY', () => {
      process.env.LLM_ENDPOINT = 'https://api.example.com';
      delete process.env.LLM_API_KEY;
      
      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };

      expect(() => validateConfig(config)).toThrow('Process exited with code: 1');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('LLM_API_KEY')
      );
    });

    it('debería lanzar error cuando faltan múltiples variables', () => {
      delete process.env.LLM_ENDPOINT;
      delete process.env.LLM_API_KEY;
      
      const config: Config = {
        provider: 'direct',
        model: undefined
      };

      expect(() => validateConfig(config)).toThrow('Process exited with code: 1');
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('GIT_AI_COMMIT_MODEL')
      );
    });
  });
});
