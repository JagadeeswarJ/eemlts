import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let routerMock: { navigate: any; url: string };

  beforeEach(() => {
    routerMock = {
      navigate: vi.fn(),
      url: '/dashboard',
    };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerMock },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should attach Bearer token when present in localStorage', () => {
    localStorage.setItem('emp_access_token', 'test-token');

    http.get('/api/v1/test').subscribe();

    const req = httpMock.expectOne('/api/v1/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer test-token');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});
  });

  it('should handle 401 by clearing storage and navigating to /sign-in with safe returnUrl', () => {
    localStorage.setItem('emp_access_token', 'expired-token');
    localStorage.setItem('emp_user_profile', JSON.stringify({ userId: 1 }));
    routerMock.url = '/employees';

    http.get('/api/v1/employees').subscribe({
      next: () => expect.fail('should have failed'),
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/v1/employees');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('emp_access_token')).toBeNull();
    expect(localStorage.getItem('emp_user_profile')).toBeNull();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/sign-in'], {
      queryParams: { returnUrl: '/employees' },
    });
  });

  it('should not clear session or redirect to sign-in on 401 from login endpoint', () => {
    http.post('/api/v1/auth/login', { email: 'wrong@company.com' }).subscribe({
      next: () => expect.fail('should have failed'),
      error: (err) => {
        expect(err.status).toBe(401);
      },
    });

    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush('Bad credentials', { status: 401, statusText: 'Unauthorized' });

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should preserve session on 403 Forbidden and NOT globally redirect away from current page', () => {
    localStorage.setItem('emp_access_token', 'valid-employee-token');
    localStorage.setItem('emp_user_profile', JSON.stringify({ role: 'EMPLOYEE' }));

    http.get('/api/v1/reports/manager-dashboard').subscribe({
      next: () => expect.fail('should have failed'),
      error: (err) => {
        expect(err.status).toBe(403);
      },
    });

    const req = httpMock.expectOne('/api/v1/reports/manager-dashboard');
    req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });

    // Session remains completely intact
    expect(localStorage.getItem('emp_access_token')).toBe('valid-employee-token');
    expect(localStorage.getItem('emp_user_profile')).not.toBeNull();
    // Interceptor does NOT force navigation to /unauthorized for individual API calls
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('should preserve session on 504 Gateway Timeout, sanitize message, and NOT redirect', () => {
    localStorage.setItem('emp_access_token', 'valid-employee-token');
    localStorage.setItem('emp_user_profile', JSON.stringify({ role: 'EMPLOYEE' }));

    http.get('/api/v1/reports/employee-dashboard').subscribe({
      next: () => expect.fail('should have failed'),
      error: (err) => {
        expect(err.status).toBe(504);
        expect(err.error?.message).toBe('Some dashboard information is temporarily unavailable. Please try again.');
      },
    });

    const req = httpMock.expectOne('/api/v1/reports/employee-dashboard');
    req.flush('Gateway Timeout', { status: 504, statusText: 'Gateway Timeout' });

    expect(localStorage.getItem('emp_access_token')).toBe('valid-employee-token');
    expect(localStorage.getItem('emp_user_profile')).not.toBeNull();
    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
