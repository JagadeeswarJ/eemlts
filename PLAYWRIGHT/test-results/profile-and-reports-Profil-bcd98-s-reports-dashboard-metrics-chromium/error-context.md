# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: profile-and-reports.spec.ts >> Profile & Reporting Dashboards >> Manager can access reports dashboard metrics
- Location: tests\profile-and-reports.spec.ts:16:7

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
  - text: manager@company.com
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
  3  | test.describe('Profile & Reporting Dashboards', () => {
  4  |   test('User can view and navigate personal profile page', async ({ page }) => {
  5  |     await page.goto('/sign-in');
  6  |     await page.locator('#work-email').fill('alex.jones@company.com');
  7  |     await page.locator('#work-password').fill('Password123!');
  8  |     await page.locator('button[type="submit"]').click();
  9  |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
  10 | 
  11 |     await page.goto('/profile');
  12 |     await expect(page).toHaveURL(/.*profile/);
  13 |     await expect(page.locator('body')).toContainText(/Profile|Alex Jones|Contact|Email/i);
  14 |   });
  15 | 
  16 |   test('Manager can access reports dashboard metrics', async ({ page }) => {
  17 |     await page.goto('/sign-in');
  18 |     await page.locator('#work-email').fill('manager@company.com');
  19 |     await page.locator('#work-password').fill('Password123!');
  20 |     await page.locator('button[type="submit"]').click();
> 21 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  22 | 
  23 |     await page.goto('/reports');
  24 |     await expect(page).toHaveURL(/.*reports/);
  25 |     await expect(page.locator('body')).toContainText(/Reports|Analytics|Overview/i);
  26 |   });
  27 | });
  28 | 
```