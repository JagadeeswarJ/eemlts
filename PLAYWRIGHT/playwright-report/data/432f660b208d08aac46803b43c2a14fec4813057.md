# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Access Control Flows >> Sign-in form validation displays error on empty or invalid inputs
- Location: tests\auth.spec.ts:14:7

# Error details

```
Error: expect(locator).toBeDisabled() failed

Locator:  locator('button[type="submit"]')
Expected: disabled
Received: enabled
Timeout:  5000ms

Call log:
  - Expect "toBeDisabled" locator('button[type="submit"]') with timeout 5000ms
  - waiting for locator('button[type="submit"]')
    14 × locator resolved to <button type="submit" aria-busy="false" _ngcontent-ng-c413250273="" class="w-full mt-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">…</button>
       - unexpected value "enabled"

```

```yaml
- button "Sign In"
```

# Test source

```ts
  1  | ﻿import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication & Access Control Flows', () => {
  4  |   test('Landing page loads with hero elements and navigation to Sign-In', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     await expect(page).toHaveTitle(/WorkPulse|Employee/i);
  7  |     // Click Sign In button or navigate
  8  |     const signInBtn = page.locator('a[routerLink="/sign-in"], a[href="/sign-in"]').first();
  9  |     await expect(signInBtn).toBeVisible();
  10 |     await signInBtn.click();
  11 |     await expect(page).toHaveURL(/.*sign-in/);
  12 |   });
  13 | 
  14 |   test('Sign-in form validation displays error on empty or invalid inputs', async ({ page }) => {
  15 |     await page.goto('/sign-in');
  16 |     const submitBtn = page.locator('button[type="submit"]');
  17 |     // Button should be disabled initially
> 18 |     await expect(submitBtn).toBeDisabled();
     |                             ^ Error: expect(locator).toBeDisabled() failed
  19 | 
  20 |     // Fill invalid email
  21 |     await page.locator('#work-email').fill('not-an-email');
  22 |     await page.locator('#work-password').fill('123');
  23 |     await expect(submitBtn).toBeDisabled();
  24 |   });
  25 | 
  26 |   test('Admin user logs in successfully and sees Admin Dashboard', async ({ page }) => {
  27 |     await page.goto('/sign-in');
  28 |     await page.locator('#work-email').fill('admin@company.com');
  29 |     await page.locator('#work-password').fill('Password123!');
  30 |     await page.locator('button[type="submit"]').click();
  31 | 
  32 |     // Should redirect to dashboard
  33 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  34 |     await expect(page.locator('body')).toContainText(/Dashboard/i);
  35 |   });
  36 | 
  37 |   test('Alex Jones (Employee) logs in successfully and sees Employee View', async ({ page }) => {
  38 |     await page.goto('/sign-in');
  39 |     await page.locator('#work-email').fill('alex.jones@company.com');
  40 |     await page.locator('#work-password').fill('Password123!');
  41 |     await page.locator('button[type="submit"]').click();
  42 | 
  43 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  44 |     await expect(page.locator('body')).toContainText(/Alex Jones|Employee/i);
  45 |   });
  46 | 
  47 |   test('Logout clears session and redirects back to sign-in', async ({ page }) => {
  48 |     await page.goto('/sign-in');
  49 |     await page.locator('#work-email').fill('admin@company.com');
  50 |     await page.locator('#work-password').fill('Password123!');
  51 |     await page.locator('button[type="submit"]').click();
  52 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  53 | 
  54 |     // Click logout
  55 |     const logoutBtn = page.locator('button:has-text("Sign Out"), button:has-text("Logout"), a:has-text("Sign Out")').first();
  56 |     if (await logoutBtn.isVisible()) {
  57 |       await logoutBtn.click();
  58 |       await expect(page).toHaveURL(/.*sign-in|.*\/$/, { timeout: 10000 });
  59 |     }
  60 |   });
  61 | });
  62 | 
```