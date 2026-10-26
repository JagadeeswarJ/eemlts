import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import * as AuthActions from './auth.actions';
import { AuthEffects } from './auth.effects';

describe('AuthEffects', () => {
  let actions$: Observable<any>;
  let effects: AuthEffects;
  let authServiceMock: { login: any; logout: any; getCurrentUser: any };
  let routerMock: { navigate: any; navigateByUrl: any };

  beforeEach(() => {
    authServiceMock = {
      login: vi.fn(),
      logout: vi.fn(),
      getCurrentUser: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
      navigateByUrl: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthEffects,
        provideMockActions(() => actions$),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParams: {} } },
        },
      ],
    });

    effects = TestBed.inject(AuthEffects);
  });

  it('should dispatch loginSuccess on successful credentials', () => {
    const mockJwt = {
      accessToken: 'jwt-123',
      tokenType: 'Bearer',
      expiresIn: 7200,
      userId: 1,
      employeeId: 10,
      email: 'admin@company.com',
      role: 'ADMIN' as const,
      fullName: 'Admin User',
    };

    authServiceMock.login.mockReturnValue(of({ success: true, data: mockJwt }));
    actions$ = of(AuthActions.login({ request: { email: 'admin@company.com', password: 'Password123!' } }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(AuthActions.loginSuccess({ response: mockJwt }));
    });
  });

  it('should dispatch loginFailure on invalid credentials', () => {
    authServiceMock.login.mockReturnValue(
      throwError(() => ({ error: { message: 'Invalid credentials' } }))
    );
    actions$ = of(AuthActions.login({ request: { email: 'wrong@company.com', password: 'bad' } }));

    effects.login$.subscribe((action) => {
      expect(action).toEqual(AuthActions.loginFailure({ error: 'Invalid credentials' }));
    });
  });
});
