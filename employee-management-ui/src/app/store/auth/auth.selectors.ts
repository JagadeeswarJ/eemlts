import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from './auth.reducer';

export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectCurrentUser = createSelector(selectAuthState, (state) => state.currentUser);
export const selectIsAuthenticated = createSelector(selectAuthState, (state) => !!state.token);
export const selectUserRole = createSelector(selectAuthState, (state) => state.currentUser?.role);
export const selectAuthLoading = createSelector(selectAuthState, (state) => state.loading);
export const selectAuthError = createSelector(selectAuthState, (state) => state.error);
