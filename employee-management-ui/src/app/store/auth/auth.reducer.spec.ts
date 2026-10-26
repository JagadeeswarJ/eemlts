import { describe, expect, it } from 'vitest';
import { CurrentUser, JwtResponse } from '../../core/models/auth.models';
import * as AuthActions from './auth.actions';
import { authReducer, initialAuthState } from './auth.reducer';

describe('authReducer', () => {
  it('should set loading true on login', () => {
    const action = AuthActions.login({
      request: { email: 'admin@company.com', password: 'Password123!' },
    });
    const state = authReducer(initialAuthState, action);

    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should store token on loginSuccess', () => {
    const response: JwtResponse = {
      accessToken: 'sample_token_xyz',
      tokenType: 'Bearer',
      expiresIn: 7200,
      userId: 1,
      employeeId: 10,
      email: 'admin@company.com',
      role: 'ADMIN',
      fullName: 'John Admin',
    };

    const action = AuthActions.loginSuccess({ response });
    const state = authReducer(initialAuthState, action);

    expect(state.loading).toBe(false);
    expect(state.token).toBe('sample_token_xyz');
  });

  it('should store currentUser on loadCurrentUserSuccess', () => {
    const user: CurrentUser = {
      userId: 1,
      employeeId: 10,
      employeeCode: 'EMP001',
      email: 'admin@company.com',
      role: 'ADMIN',
      firstName: 'John',
      lastName: 'Admin',
      fullName: 'John Admin',
      departmentId: 1,
      departmentName: 'Engineering',
      designation: 'Administrator',
    };

    const action = AuthActions.loadCurrentUserSuccess({ user });
    const state = authReducer(initialAuthState, action);

    expect(state.currentUser).toEqual(user);
    expect(state.loading).toBe(false);
  });

  it('should clear state on logoutSuccess', () => {
    const loggedInState = {
      ...initialAuthState,
      token: 'some_token',
      currentUser: {} as any,
    };

    const state = authReducer(loggedInState, AuthActions.logoutSuccess());

    expect(state.token).toBeNull();
    expect(state.currentUser).toBeNull();
  });
});
