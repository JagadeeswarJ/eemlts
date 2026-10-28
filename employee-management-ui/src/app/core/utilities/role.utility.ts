import { Role } from '../models/auth.models';

/**
 * Normalizes any role representation into a strongly-typed EMS Role.
 * Handles prefixes like 'ROLE_', mixed casing, and whitespace.
 */
export function normalizeRole(role: string | null | undefined): Role {
  if (!role) {
    return 'EMPLOYEE';
  }

  const clean = role.trim().toUpperCase().replace(/^ROLE_/, '');

  switch (clean) {
    case 'ADMIN':
      return 'ADMIN';
    case 'HR':
      return 'HR';
    case 'MANAGER':
      return 'MANAGER';
    case 'EMPLOYEE':
    default:
      return 'EMPLOYEE';
  }
}

/**
 * Checks if a given role is one of the allowed roles.
 */
export function hasRole(currentRole: string | null | undefined, allowedRoles: Role[]): boolean {
  const normalized = normalizeRole(currentRole);
  return allowedRoles.includes(normalized);
}
