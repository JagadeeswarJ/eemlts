import { test, expect } from '@playwright/test';

test.describe('Attendance Tracking & Regularization Workflows', () => {
  test.beforeEach(async ({ page }) => {
    // Login as employee Alex Jones
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  });

  test('Employee can navigate to Attendance Dashboard and view today status', async ({ page }) => {
    await page.goto('/attendance');
    await expect(page).toHaveURL(/.*attendance/);
    await expect(page.locator('body')).toContainText(/Attendance/i);
  });

  test('Employee can view attendance history records', async ({ page }) => {
    await page.goto('/attendance/history');
    await expect(page).toHaveURL(/.*attendance\/history/);
    await expect(page.locator('body')).toContainText(/History|Date|Hours/i);
  });

  test('Employee can open and inspect attendance corrections workflow', async ({ page }) => {
    await page.goto('/attendance/corrections');
    await expect(page).toHaveURL(/.*attendance\/corrections/);
    await expect(page.locator('body')).toContainText(/Correction|Regularization|Request/i);
  });
});
