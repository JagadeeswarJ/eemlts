import { createReducer, on } from '@ngrx/store';
import { CurrentUser } from '../../core/models/auth.models';
import * as AuthActions from './auth.actions';

export interface AuthState {
  currentUser: CurrentUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export const initialAuthState: AuthState = {
  currentUser: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('emp_access_token') : null,
  loading: false,
  error: null,
};

export const authReducer = createReducer(
  initialAuthState,
  on(AuthActions.login, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loginSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    token: response.accessToken,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.loadCurrentUser, (state) => ({ ...state, loading: true, error: null })),
  on(AuthActions.loadCurrentUserSuccess, (state, { user }) => ({
    ...state,
    loading: false,
    currentUser: user,
    error: null,
  })),
  on(AuthActions.loadCurrentUserFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),
  on(AuthActions.logoutSuccess, () => ({
    currentUser: null,
    token: null,
    loading: false,
    error: null,
  }))
);
