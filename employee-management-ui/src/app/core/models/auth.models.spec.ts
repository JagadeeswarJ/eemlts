import { describe, expect, it } from 'vitest';
import { CurrentUser, JwtResponse, LoginRequest, Role } from './auth.models';

describe('Auth Models', () => {
  it('should define valid CurrentUser model', () => {
    const user: CurrentUser = {
      userId: 1,
      employeeId: 10,
      employeeCode: 'EMP001',
      email: 'admin@company.com',
      role: 'ADMIN',
      firstName: 'John',
      lastName: 'Admin',
      fullName: 'John Admin',
      departmentId: 1,
      departmentName: 'HR',
      designation: 'Administrator',
    };
    expect(user.role).toBe('ADMIN');
    expect(user.email).toBe('admin@company.com');
  });

  it('should define valid LoginRequest model', () => {
    const req: LoginRequest = {
      email: 'alex.jones@company.com',
      password: 'Password123!',
    };
    expect(req.email).toBe('alex.jones@company.com');
  });

  it('should define valid JwtResponse model', () => {
    const jwt: JwtResponse = {
      accessToken: 'token-xyz',
      tokenType: 'Bearer',
      expiresIn: 7200,
      userId: 2,
      employeeId: 4,
      email: 'alex@company.com',
      role: 'EMPLOYEE',
      fullName: 'Alex Jones',
    };
    expect(jwt.tokenType).toBe('Bearer');
    expect(jwt.expiresIn).toBe(7200);
  });
});
