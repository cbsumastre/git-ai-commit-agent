import { describe, it, expect } from 'vitest';
import type { Config } from '../index.js';

describe('Main - Integration', () => {
  it('verificar que los módulos se exportan correctamente', async () => {
    const indexModule = await import('../index.js');
    
    expect(typeof indexModule.getConfig).toBe('function');
    expect(typeof indexModule.validateConfig).toBe('function');
    expect(typeof indexModule.getGitDiff).toBe('function');
    expect(typeof indexModule.buildPrompt).toBe('function');
    expect(typeof indexModule.callDirectAPI).toBe('function');
    expect(typeof indexModule.callBedrock).toBe('function');
    expect(typeof indexModule.run).toBe('function');
  });

  it('verificar que el tipo Config funciona correctamente', async () => {
    const config: Config = {
      provider: 'direct',
      model: 'gpt-4'
    };
    
    expect(config.provider).toBe('direct');
    expect(config.model).toBe('gpt-4');
  });
});
