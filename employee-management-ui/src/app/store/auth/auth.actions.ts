import { createAction, props } from '@ngrx/store';
import { CurrentUser, JwtResponse, LoginRequest } from '../../core/models/auth.models';

export const login = createAction('[Auth] Login', props<{ request: LoginRequest }>());
export const loginSuccess = createAction('[Auth] Login Success', props<{ response: JwtResponse }>());
export const loginFailure = createAction('[Auth] Login Failure', props<{ error: string }>());

export const loadCurrentUser = createAction('[Auth] Load Current User');
export const loadCurrentUserSuccess = createAction('[Auth] Load Current User Success', props<{ user: CurrentUser }>());
export const loadCurrentUserFailure = createAction('[Auth] Load Current User Failure', props<{ error: string }>());

export const logout = createAction('[Auth] Logout');
export const logoutSuccess = createAction('[Auth] Logout Success');
