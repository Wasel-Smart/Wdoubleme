import { describe, expect, it } from 'vitest';
import { getConfig, getEnv, hasEnv } from '@/utils/env';

describe('workspace configuration utilities', () => {
  it('returns defaults when environment variables are missing', () => {
    expect(getEnv('VITE_DOES_NOT_EXIST', 'fallback')).toBe('fallback');
    expect(hasEnv('VITE_DOES_NOT_EXIST')).toBe(false);
  });

  it('exposes stable application defaults', () => {
    const config = getConfig();

    expect(config.appUrl).toBeTruthy();
    expect(config.appName).toBeTruthy();
    expect(typeof config.isProd).toBe('boolean');
    expect(typeof config.isDev).toBe('boolean');
  });
});
