import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiResponse, CurrentUser, JwtResponse } from '../models/auth.models';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call login and persist token on success', () => {
    const mockJwt: ApiResponse<JwtResponse> = {
      success: true,
      data: {
        accessToken: 'access-token-123',
        tokenType: 'Bearer',
        expiresIn: 7200,
        userId: 1,
        employeeId: 4,
        email: 'alex.jones@company.com',
        role: 'EMPLOYEE',
        fullName: 'Alex Jones',
      },
    };

    service.login({ email: 'alex.jones@company.com', password: 'Password123!' }).subscribe((res) => {
      expect(res.data.accessToken).toBe('access-token-123');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockJwt);

    expect(localStorage.getItem('emp_access_token')).toBe('access-token-123');
  });

  it('should call logout and clear local storage', () => {
    localStorage.setItem('emp_access_token', 'token-123');
    localStorage.setItem('emp_user_profile', '{}');

    service.logout().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/logout');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: 'Logged out' });

    expect(localStorage.getItem('emp_access_token')).toBeNull();
    expect(localStorage.getItem('emp_user_profile')).toBeNull();
  });

  it('should call getCurrentUser and store user profile', () => {
    const mockUser: ApiResponse<CurrentUser> = {
      success: true,
      data: {
        userId: 4,
        employeeId: 4,
        employeeCode: 'EMP004',
        email: 'alex.jones@company.com',
        role: 'EMPLOYEE',
        firstName: 'Alex',
        lastName: 'Jones',
        fullName: 'Alex Jones',
        departmentId: 1,
        departmentName: 'Engineering',
        designation: 'Senior Engineer',
      },
    };

    service.getCurrentUser().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/me');
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);

    expect(service.getStoredUser()?.email).toBe('alex.jones@company.com');
  });

  it('should call forgotPassword with email', () => {
    service.forgotPassword('alex@company.com').subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/auth/forgot-password');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'alex@company.com' });
    req.flush({ success: true, data: 'Sent' });
  });
});
