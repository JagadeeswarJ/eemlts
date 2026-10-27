# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Authentication & Access Control Flows >> Admin user logs in successfully and sees Admin Dashboard
- Location: tests\auth.spec.ts:26:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /.*dashboard/
Received string:  "http://localhost:4200/sign-in"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    33 × locator resolved to <html lang="en">…</html>
       - unexpected value "http://localhost:4200/sign-in"

```

```yaml
- link "Back to Home":
  - /url: /
  - img
  - text: Back to Home
- text: WP
- heading "WorkPulse" [level=1]
- text: Enterprise HR Portal
- heading "Empowering modern teams to work better together." [level=2]
- paragraph: A unified workspace for attendance recording, leave management, team calendars, and human capital workflows.
- img
- paragraph: Manage attendance effortlessly
- paragraph: Single-click check-ins with automatic work duration calculations.
- img
- paragraph: Request and track leave
- paragraph: Real-time balances across Casual, Sick, and Earned allowances.
- img
- paragraph: Stay connected with your team
- paragraph: Department rosters and manager review workflows.
- text: Secure Enterprise Login WorkPulse v1.0
- heading "Welcome back" [level=3]
- paragraph: Please enter your work email and password to access your portal.
- alert:
  - img
  - text: Some dashboard information is temporarily unavailable. Please try again.
  - button:
    - img
- text: Work Email *
- textbox "Work Email *":
  - /placeholder: name@company.com
  - text: admin@company.com
- text: Password *
- link "Forgot password?":
  - /url: /forgot-password
- textbox "Password *":
  - /placeholder: ••••••••••••
  - text: Password123!
- button "Show password"
- button "Sign In"
- paragraph:
  - text: Don't have an account yet?
  - link "Request access / Sign up →":
    - /url: /sign-up
- button "Quick Demo Access Accounts Hide":
  - img
  - text: Quick Demo Access Accounts Hide
- button "Admin admin@company.com":
  - paragraph: Admin
  - paragraph: admin@company.com
- button "HR Director hr@company.com":
  - paragraph: HR Director
  - paragraph: hr@company.com
- button "Team Manager manager@company.com":
  - paragraph: Team Manager
  - paragraph: manager@company.com
- button "Staff Employee alex.jones@company.com":
  - paragraph: Staff Employee
  - paragraph: alex.jones@company.com
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
  18 |     await expect(submitBtn).toBeDisabled();
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
> 33 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
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