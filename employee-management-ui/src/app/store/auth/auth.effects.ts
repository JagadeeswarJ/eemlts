import { inject, Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of, tap } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';

@Injectable()
export class AuthEffects {
  private readonly actions$ = inject(Actions);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      mergeMap(({ request }) =>
        this.authService.login(request).pipe(
          map((res) => {
            if (res.success && res.data) {
              return AuthActions.loginSuccess({ response: res.data });
            }
            return AuthActions.loginFailure({ error: res.message || 'Login failed' });
          }),
          catchError((err) =>
            of(AuthActions.loginFailure({ error: err.error?.message || 'Invalid email or password' }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => {
          let returnUrl: string | null = null;
          if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            returnUrl = urlParams.get('returnUrl');
          }

          if (
            returnUrl &&
            returnUrl.startsWith('/') &&
            !returnUrl.startsWith('//') &&
            !returnUrl.startsWith('/sign-in') &&
            !returnUrl.startsWith('/login') &&
            !returnUrl.startsWith('/unauthorized')
          ) {
            this.router.navigateByUrl(returnUrl);
          } else {
            this.router.navigate(['/dashboard']);
          }
        })
      ),
    { dispatch: false }
  );

  loadCurrentUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.loadCurrentUser, AuthActions.loginSuccess),
      mergeMap(() =>
        this.authService.getCurrentUser().pipe(
          map((res) => {
            if (res.success && res.data) {
              return AuthActions.loadCurrentUserSuccess({ user: res.data });
            }
            return AuthActions.loadCurrentUserFailure({
              error: res.message || 'Failed to load user profile',
            });
          }),
          catchError((err) => of(AuthActions.loadCurrentUserFailure({ error: err.message })))
        )
      )
    )
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      mergeMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError(() => of(AuthActions.logoutSuccess()))
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => {
          this.router.navigate(['/sign-in']);
        })
      ),
    { dispatch: false }
  );
}
