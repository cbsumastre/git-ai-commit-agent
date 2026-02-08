import { describe, it, expect, vi, beforeEach } from 'vitest';
import { callDirectAPI, Config } from '../index.js';

describe('LLM Providers', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    process.env.LLM_ENDPOINT = 'https://api.example.com/v1/chat/completions';
    process.env.LLM_API_KEY = 'test-api-key';
  });

  describe('callDirectAPI', () => {
    it('debería llamar a la API con los parámetros correctos', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '1. feat: add new feature\n2. chore: update dependencies\n3. doc: update readme'
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };
      const prompt = 'Generate commit messages for this diff';

      const result = await callDirectAPI(config, prompt);

      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.example.com/v1/chat/completions',
        {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer test-api-key',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: 'gpt-4',
            messages: [{ role: 'user', content: prompt }]
          })
        }
      );
      expect(result).toBe(mockResponse.choices[0].message.content.trim());
    });

    it('debería lanzar error cuando la respuesta HTTP no es ok', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      } as Response);

      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };

      await expect(callDirectAPI(config, 'test prompt')).rejects.toThrow('HTTP error! status: 401');
    });

    it('debería manejar respuesta vacía', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: '   '
          }
        }]
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      } as Response);

      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };

      const result = await callDirectAPI(config, 'test');

      expect(result).toBe('');
    });

    it('debería manejar error de red', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const config: Config = {
        provider: 'direct',
        model: 'gpt-4'
      };

      await expect(callDirectAPI(config, 'test')).rejects.toThrow('Network error');
    });
  });
});
