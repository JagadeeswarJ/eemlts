import { describe, expect, it } from 'vitest';
import { hasRole, normalizeRole } from './role.utility';

describe('Role Utility', () => {
  it('should normalize standard roles', () => {
    expect(normalizeRole('ADMIN')).toBe('ADMIN');
    expect(normalizeRole('HR')).toBe('HR');
    expect(normalizeRole('MANAGER')).toBe('MANAGER');
    expect(normalizeRole('EMPLOYEE')).toBe('EMPLOYEE');
  });

  it('should normalize Spring Security ROLE_ prefixed roles', () => {
    expect(normalizeRole('ROLE_ADMIN')).toBe('ADMIN');
    expect(normalizeRole('ROLE_HR')).toBe('HR');
    expect(normalizeRole('ROLE_MANAGER')).toBe('MANAGER');
    expect(normalizeRole('ROLE_EMPLOYEE')).toBe('EMPLOYEE');
  });

  it('should handle case-insensitivity and whitespace', () => {
    expect(normalizeRole('  manager  ')).toBe('MANAGER');
    expect(normalizeRole('role_admin')).toBe('ADMIN');
    expect(normalizeRole('Hr')).toBe('HR');
  });

  it('should default null, undefined, or unknown roles to EMPLOYEE', () => {
    expect(normalizeRole(null)).toBe('EMPLOYEE');
    expect(normalizeRole(undefined)).toBe('EMPLOYEE');
    expect(normalizeRole('')).toBe('EMPLOYEE');
    expect(normalizeRole('UNKNOWN')).toBe('EMPLOYEE');
  });

  it('should evaluate hasRole correctly', () => {
    expect(hasRole('ROLE_ADMIN', ['ADMIN', 'HR'])).toBe(true);
    expect(hasRole('EMPLOYEE', ['ADMIN', 'MANAGER'])).toBe(false);
    expect(hasRole('manager', ['MANAGER'])).toBe(true);
  });
});
