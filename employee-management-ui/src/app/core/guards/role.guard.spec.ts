import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { roleGuard } from './role.guard';

describe('roleGuard', () => {
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

  it('should allow access if user has one of allowed roles', () => {
    localStorage.setItem(
      'emp_user_profile',
      JSON.stringify({ email: 'admin@company.com', role: 'ADMIN' })
    );

    const guard = roleGuard(['ADMIN', 'HR']);
    const result = TestBed.runInInjectionContext(() =>
      guard({} as any, { url: '/employees' } as any)
    );

    expect(result).toBe(true);
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should redirect to unauthorized if user does not have allowed role', () => {
    localStorage.setItem(
      'emp_user_profile',
      JSON.stringify({ email: 'emp@company.com', role: 'EMPLOYEE' })
    );

    const guard = roleGuard(['ADMIN', 'HR']);
    const result = TestBed.runInInjectionContext(() =>
      guard({} as any, { url: '/employees' } as any)
    );

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/unauthorized']);
  });
});
