import { test, expect } from '@playwright/test';

test.describe('Leave Management & Application Flows', () => {
  test('Employee can inspect leave balances and quotas', async ({ page }) => {
    // Login as Alex Jones
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    await page.goto('/leaves');
    await expect(page).toHaveURL(/.*leaves/);
    await expect(page.locator('body')).toContainText(/Leave|Balance|Quota|Days/i);
  });

  test('Employee can navigate to leave application form', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('alex.jones@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    await page.goto('/leaves/apply');
    await expect(page).toHaveURL(/.*leaves\/apply/);
    await expect(page.locator('body')).toContainText(/Apply|Start Date|End Date|Reason/i);
  });

  test('Manager David Miller can inspect pending leave approvals queue', async ({ page }) => {
    await page.goto('/sign-in');
    await page.locator('#work-email').fill('manager@company.com');
    await page.locator('#work-password').fill('Password123!');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });

    await page.goto('/leaves/approvals');
    await expect(page).toHaveURL(/.*leaves\/approvals/);
    await expect(page.locator('body')).toContainText(/Approval|Pending|Request/i);
  });
});
