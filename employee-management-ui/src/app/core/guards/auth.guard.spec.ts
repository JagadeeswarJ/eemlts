import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let routerMock: { navigate: any };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [{ provide: Router, useValue: routerMock }],
    });

    localStorage.clear();
  });

  it('should allow access if token and userProfile exist', () => {
    localStorage.setItem('emp_access_token', 'mock_token');
    localStorage.setItem('emp_user_profile', JSON.stringify({ email: 'test@company.com' }));

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/dashboard' } as any)
    );

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to /sign-in if not authenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as any, { url: '/dashboard' } as any)
    );

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in'], {
      queryParams: { returnUrl: '/dashboard' },
    });
  });
});
