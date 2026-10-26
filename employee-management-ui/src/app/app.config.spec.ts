import { describe, expect, it } from 'vitest';
import { appConfig } from './app.config';

describe('AppConfig', () => {
  it('should define core providers including store and router', () => {
    expect(appConfig).toBeDefined();
    expect(appConfig.providers).toBeDefined();
    expect(appConfig.providers.length).toBeGreaterThan(0);
  });
});
