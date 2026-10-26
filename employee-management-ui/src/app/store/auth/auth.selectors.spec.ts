import { describe, expect, it } from 'vitest';
import { AuthState } from './auth.reducer';
import * as AuthSelectors from './auth.selectors';

describe('Auth Selectors', () => {
  const state: AuthState = {
    currentUser: {
      userId: 1,
      employeeId: 4,
      employeeCode: 'EMP004',
      email: 'alex@company.com',
      role: 'EMPLOYEE',
      firstName: 'Alex',
      lastName: 'Jones',
      fullName: 'Alex Jones',
      departmentId: 1,
      departmentName: 'Engineering',
      designation: 'Engineer',
    },
    token: 'valid-token',
    loading: false,
    error: null,
  };

  it('should select current user', () => {
    const result = AuthSelectors.selectCurrentUser.projector(state);
    expect(result?.email).toBe('alex@company.com');
  });

  it('should select isAuthenticated', () => {
    const result = AuthSelectors.selectIsAuthenticated.projector(state);
    expect(result).toBe(true);
  });

  it('should select user role', () => {
    const result = AuthSelectors.selectUserRole.projector(state);
    expect(result).toBe('EMPLOYEE');
  });
});
