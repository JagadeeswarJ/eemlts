# EMS — Automated Playwright E2E Test Suite

Automated End-to-End (E2E) testing suite for the **EMS** enterprise platform using **Playwright Test** and **Chromium**.

## Running Tests

### Run all tests in headless mode
```bash
npx playwright test
```

### Run tests with interactive UI
```bash
npx playwright test --ui
```

### View HTML Test Report
```bash
npx playwright show-report
```

---

## Test Suites & Coverage (16 Tests — 100% Pass Rate)

1. **`tests/auth.spec.ts`**:
   - Landing page loads with EMS branding and navigation to Sign-In
   - Sign-in form validation displays errors on empty or invalid inputs
   - Admin user logs in successfully and sees Admin Dashboard
   - Alex Jones (Employee) logs in successfully and sees Employee View
   - Logout clears session and redirects back to sign-in

2. **`tests/attendance.spec.ts`**:
   - Employee navigates to Attendance Dashboard and views today status
   - Employee views attendance history records
   - Employee opens and inspects attendance corrections workflow

3. **`tests/leave.spec.ts`**:
   - Employee inspects leave balances and annual quotas
   - Employee navigates to leave application form
   - Manager David Miller inspects pending leave approvals queue

4. **`tests/navigation.spec.ts`**:
   - Unauthenticated user cannot access protected `/dashboard`
   - Employee accessing administrative route (`/departments`) gets redirected to `/unauthorized`
   - Admin user navigates through all administrative modules (`/departments`, `/employees`, `/reports`)

5. **`tests/profile-and-reports.spec.ts`**:
   - User views and navigates personal profile page
   - Manager accesses reports dashboard metrics
