import { describe, expect, it } from 'vitest';
import * as AuthActions from './auth.actions';

describe('Auth Actions', () => {
  it('should create login action', () => {
    const action = AuthActions.login({
      request: { email: 'admin@company.com', password: 'Password123!' },
    });
    expect(action.type).toBe('[Auth] Login');
    expect(action.request.email).toBe('admin@company.com');
  });

  it('should create logout action', () => {
    const action = AuthActions.logout();
    expect(action.type).toBe('[Auth] Logout');
  });

  it('should create loadCurrentUser action', () => {
    const action = AuthActions.loadCurrentUser();
    expect(action.type).toBe('[Auth] Load Current User');
  });
});
