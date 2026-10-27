import { test, expect } from '@playwright/test';

test.describe('Role-Based Navigation & Route Guards', () => {
  test('Unauthenticated user cannot access protected /dashboard', async ({ page }) => {
    // Clear cookies first
    await page.context().clearCookies();
    await page.goto('/dashboard');
    // Should be redirected to sign-in or public landing
    await expect(page).toHaveURL(/.*sign-in|.*\/$/, { timeout: 10000 });
  });

  test('Employee accessing administrative route gets redirected to unauthorized', async ({ page }) => {
    // Login as employee Alex Jones
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // Try navigating to administrative departments page
    await page.goto('/departments');
    await expect(page).toHaveURL(/.*unauthorized|.*dashboard/, { timeout: 10000 });
  });

  test('Admin user can navigate through all administrative modules', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('admin@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // Navigate to Departments
    await page.goto('/departments');
    await expect(page).toHaveURL(/.*departments/);
    await expect(page.locator('body')).toContainText(/Department/i);

    // Navigate to Employees
    await page.goto('/employees');
    await expect(page).toHaveURL(/.*employees/);
    await expect(page.locator('body')).toContainText(/Employee/i);

    // Navigate to Reports
    await page.goto('/reports');
    await expect(page).toHaveURL(/.*reports/);
  });
});
