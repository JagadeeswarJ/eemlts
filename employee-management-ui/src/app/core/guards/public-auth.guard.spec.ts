import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { publicAuthGuard } from './public-auth.guard';

describe('publicAuthGuard', () => {
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

  it('should allow access if unauthenticated', () => {
    const result = TestBed.runInInjectionContext(() =>
      publicAuthGuard({} as any, {} as any)
    );

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect authenticated users to /dashboard', () => {
    localStorage.setItem('emp_access_token', 'mock_token');
    localStorage.setItem('emp_user_profile', JSON.stringify({ email: 'alex@company.com' }));

    const result = TestBed.runInInjectionContext(() =>
      publicAuthGuard({} as any, {} as any)
    );

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
