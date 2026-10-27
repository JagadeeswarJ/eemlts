# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: navigation.spec.ts >> Role-Based Navigation & Route Guards >> Admin user can navigate through all administrative modules
- Location: tests\navigation.spec.ts:25:7

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
  - text: Invalid email or password
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
  3  | test.describe('Role-Based Navigation & Route Guards', () => {
  4  |   test('Unauthenticated user cannot access protected /dashboard', async ({ page }) => {
  5  |     // Clear cookies first
  6  |     await page.context().clearCookies();
  7  |     await page.goto('/dashboard');
  8  |     // Should be redirected to sign-in or public landing
  9  |     await expect(page).toHaveURL(/.*sign-in|.*\/$/, { timeout: 10000 });
  10 |   });
  11 | 
  12 |   test('Employee accessing administrative route gets redirected to unauthorized', async ({ page }) => {
  13 |     // Login as employee Alex Jones
  14 |     await page.goto('/sign-in');
  15 |     await page.locator('#work-email').fill('alex.jones@company.com');
  16 |     await page.locator('#work-password').fill('Password123!');
  17 |     await page.locator('button[type="submit"]').click();
  18 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  19 | 
  20 |     // Try navigating to administrative departments page
  21 |     await page.goto('/departments');
  22 |     await expect(page).toHaveURL(/.*unauthorized|.*dashboard/, { timeout: 10000 });
  23 |   });
  24 | 
  25 |   test('Admin user can navigate through all administrative modules', async ({ page }) => {
  26 |     await page.goto('/sign-in');
  27 |     await page.locator('#work-email').fill('admin@company.com');
  28 |     await page.locator('#work-password').fill('Password123!');
  29 |     await page.locator('button[type="submit"]').click();
> 30 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  31 | 
  32 |     // Navigate to Departments
  33 |     await page.goto('/departments');
  34 |     await expect(page).toHaveURL(/.*departments/);
  35 |     await expect(page.locator('body')).toContainText(/Department/i);
  36 | 
  37 |     // Navigate to Employees
  38 |     await page.goto('/employees');
  39 |     await expect(page).toHaveURL(/.*employees/);
  40 |     await expect(page.locator('body')).toContainText(/Employee/i);
  41 | 
  42 |     // Navigate to Reports
  43 |     await page.goto('/reports');
  44 |     await expect(page).toHaveURL(/.*reports/);
  45 |   });
  46 | });
  47 | 
```