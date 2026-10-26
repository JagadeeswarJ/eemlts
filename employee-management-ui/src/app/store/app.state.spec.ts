import { describe, expect, it } from 'vitest';
import { appReducers } from './app.state';

describe('AppState', () => {
  it('should register all expected reducer keys', () => {
    expect(appReducers.auth).toBeDefined();
    expect(appReducers.departments).toBeDefined();
    expect(appReducers.employee).toBeDefined();
    expect(appReducers.attendance).toBeDefined();
    expect(appReducers.leave).toBeDefined();
    expect(appReducers.report).toBeDefined();
  });
});
