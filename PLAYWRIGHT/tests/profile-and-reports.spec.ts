import { test, expect } from '@playwright/test';

test.describe('Profile & Reporting Dashboards', () => {
  test('User can view and navigate personal profile page', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    await page.goto('/profile');
    await expect(page).toHaveURL(/.*profile/);
    await expect(page.locator('body')).toContainText(/Profile|Alex Jones|Contact|Email/i);
  });

  test('Manager can access reports dashboard metrics', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('manager@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    await page.goto('/reports');
    await expect(page).toHaveURL(/.*reports/);
    await expect(page.locator('body')).toContainText(/Reports|Analytics|Overview/i);
  });
});
