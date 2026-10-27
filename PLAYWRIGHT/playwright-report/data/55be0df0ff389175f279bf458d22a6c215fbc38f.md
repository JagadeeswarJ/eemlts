# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: attendance.spec.ts >> Attendance Tracking & Regularization Workflows >> Employee can navigate to Attendance Dashboard and view today status
- Location: tests\attendance.spec.ts:13:7

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
  - text: alex.jones@company.com
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
  3  | test.describe('Attendance Tracking & Regularization Workflows', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     // Login as employee Alex Jones
  6  |     await page.goto('/sign-in');
  7  |     await page.locator('#work-email').fill('alex.jones@company.com');
  8  |     await page.locator('#work-password').fill('Password123!');
  9  |     await page.locator('button[type="submit"]').click();
> 10 |     await expect(page).toHaveURL(/.*dashboard/, { timeout: 15000 });
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  11 |   });
  12 | 
  13 |   test('Employee can navigate to Attendance Dashboard and view today status', async ({ page }) => {
  14 |     await page.goto('/attendance');
  15 |     await expect(page).toHaveURL(/.*attendance/);
  16 |     await expect(page.locator('body')).toContainText(/Attendance/i);
  17 |   });
  18 | 
  19 |   test('Employee can view attendance history records', async ({ page }) => {
  20 |     await page.goto('/attendance/history');
  21 |     await expect(page).toHaveURL(/.*attendance\/history/);
  22 |     await expect(page.locator('body')).toContainText(/History|Date|Hours/i);
  23 |   });
  24 | 
  25 |   test('Employee can open and inspect attendance corrections workflow', async ({ page }) => {
  26 |     await page.goto('/attendance/corrections');
  27 |     await expect(page).toHaveURL(/.*attendance\/corrections/);
  28 |     await expect(page.locator('body')).toContainText(/Correction|Regularization|Request/i);
  29 |   });
  30 | });
  31 | 
```