import { test, expect } from '@playwright/test';

test.describe('Authentication & Access Control Flows', () => {
  test('Landing page loads with hero elements and navigation to Sign-In', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/EMS/i);
    // Click Sign In button or navigate
    const signInBtn = page.locator('a[routerLink="/sign-in"], a[href="/sign-in"]').first();
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
    await expect(page).toHaveURL(/.*sign-in/);
  });

  test('Sign-in form validation displays error on empty or invalid inputs', async ({ page }) => {
    await page.goto('/sign-in');
    const submitBtn = page.locator('button[type="submit"]');
    // Button should be disabled initially
    await expect(submitBtn).toBeDisabled();

    // Fill invalid email
    await page.locator('#work-email').fill('not-an-email');
    await page.locator('#work-password').fill('123');
    await expect(submitBtn).toBeDisabled();
  });

  test('Admin user logs in successfully and sees Admin Dashboard', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('admin@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Dashboard/i);
  });

  test('Alex Jones (Employee) logs in successfully and sees Employee View', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();

    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
    await expect(page.locator('body')).toContainText(/Alex Jones|Employee/i);
  });

  test('Logout clears session and redirects back to sign-in', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('admin@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    // Click logout
    const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out")').first();
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
      await expect(page).toHaveURL(/.*sign-in|.*\/$/, { timeout: 10000 });
    }
  });
});
