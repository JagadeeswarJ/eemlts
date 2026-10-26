import { describe, expect, it } from 'vitest';
import { routes } from './app.routes';

describe('AppRoutes', () => {
  it('should declare public landing as the root route', () => {
    const root = routes.find((r) => r.path === '');
    expect(root).toBeDefined();
    expect(root?.pathMatch).toBe('full');
  });

  it('should declare canonical sign-in and legacy login redirect', () => {
    const signIn = routes.find((r) => r.path === 'sign-in');
    const login = routes.find((r) => r.path === 'login');

    expect(signIn).toBeDefined();
    expect(login).toBeDefined();
    expect(login?.redirectTo).toBe('sign-in');
  });

  it('should declare static routes before parameterized routes for employees', () => {
    const mainShell = routes.find((r) => r.path === '' && r.children);
    expect(mainShell).toBeDefined();

    const children = mainShell!.children!;
    const newIdx = children.findIndex((r) => r.path === 'employees/new');
    const paramIdx = children.findIndex((r) => r.path === 'employees/:id');

    expect(newIdx).toBeGreaterThanOrEqual(0);
    expect(paramIdx).toBeGreaterThanOrEqual(0);
    expect(newIdx).toBeLessThan(paramIdx);
  });

  it('should declare wildcard fallback pointing to not-found', () => {
    const wildcard = routes.find((r) => r.path === '**');
    expect(wildcard).toBeDefined();
    expect(wildcard?.redirectTo).toBe('not-found');
  });
});
