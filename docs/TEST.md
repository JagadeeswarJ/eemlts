# EMS — Complete End-to-End Testing Guide & Sequence

This document provides a complete, step-by-step testing manual for the **EMS (Employee Management System)** platform. It guides testers, developers, and QA engineers through testing every capability in exact sequential order, from automated verification to manual multi-role enterprise workflows.

---

## 1. Prerequisites & Environment Check

Before initiating testing, ensure the following core dependencies are active:

| Service / Tool | Expected Version | Port | Status Check Command |
|---|---|---|---|
| **MySQL 8.0 Server** | 8.0.x | `3306` | `cmd.exe /c "sc query MySQL80"` |
| **Java Development Kit** | JDK 17+ | N/A | `java -version` |
| **Node.js & npm** | Node 20+, npm 10+ | N/A | `node -v && npm -v` |
| **Database Instance** | `employee_management_db` | `3306` | `"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "SHOW TABLES IN employee_management_db;"` |

---

## 2. Service Startup & Port Verification

All 6 microservices import credentials from `microservices/database.yml`. Start all components using the provided batch scripts:

### Step 1: Start Backend Microservices
```cmd
microservices\2-start-all-services.bat --no-pause
```
Wait ~20 seconds for the service registry and dependent services to initialize.

### Step 2: Verify Active Listening Ports
Run the following check to verify all microservices are running:
```cmd
netstat -ano | findstr /R /C:":8761 .*LISTENING" /C:":8080 .*LISTENING" /C:":8081 .*LISTENING" /C:":8082 .*LISTENING" /C:":8083 .*LISTENING" /C:":8084 .*LISTENING"
```

| Microservice | Port | URL / Health Check |
|---|---|---|
| **Employee-Service-Registry** | `8761` | `http://localhost:8761` (Eureka Dashboard) |
| **Employee-API-Gateway** | `8080` | `http://localhost:8080/actuator/health` |
| **Employee-Management-Service** | `8081` | Routed through Gateway (`http://localhost:8080/api/v1/employees`) |
| **Attendance-Management-Service** | `8082` | Routed through Gateway (`http://localhost:8080/api/v1/attendance`) |
| **Leave-Management-Service** | `8083` | Routed through Gateway (`http://localhost:8080/api/v1/leaves`) |
| **Reporting-Dashboard-Service** | `8084` | Routed through Gateway (`http://localhost:8080/api/v1/reports`) |

### Step 3: Start Angular Frontend Application
```cmd
cd employee-management-ui
npm start
```
Frontend will be active at: **`http://localhost:4200`**

---

## 3. Seed Credentials & Access Matrix

All test accounts in the seeded database share the identical password: **`Password123!`**

| Full Name | Email Address | Role | Department | Testing Scope |
|---|---|---|---|---|
| **Alex Jones** | `alex.jones@company.com` | `EMPLOYEE` | Engineering | Self-service attendance, punch clock, leave requests, profile updates |
| **Sarah Smith** | `sarah.smith@company.com` | `EMPLOYEE` | Engineering | Secondary employee for concurrent punch and team calendar checks |
| **David Miller** | `manager@company.com` | `MANAGER` | Engineering | Team attendance roll call, leave approvals, regularization decisions |
| **Sarah Jenkins** | `hr@company.com` | `HR` | Human Resources | Employee directory, leave configuration, quota allocations |
| **John Admin** | `admin@company.com` | `ADMIN` | Human Resources | Department administration, system-wide analytics, full privileges |

---

## 4. Sequential Testing Walkthrough

Follow this test sequence from Stage 1 through Stage 6 for complete coverage.

```
+-----------------------------------------------------------------------------------+
|                            SEQUENTIAL TEST PIPELINE                               |
+-----------------------------------------------------------------------------------+
| Stage 1: Automated E2E Test Suite (Fast Regression Baseline)                      |
|    |                                                                              |
|    v                                                                              |
| Stage 2: Public Navigation & Authentication Boundary (`/`, `/sign-in`)            |
|    |                                                                              |
|    v                                                                              |
| Stage 3: Employee Journey — Alex Jones (Clock-In, Leaves, Profile)                 |
|    |                                                                              |
|    v                                                                              |
| Stage 4: Manager Journey — David Miller (Approvals, Team Calendar, Regularization) |
|    |                                                                              |
|    v                                                                              |
| Stage 5: HR / Admin Journey — John Admin (Departments, Quotas, Directory, Reports)|
|    |                                                                              |
|    v                                                                              |
| Stage 6: Security & Role-Based Access Control Boundaries (Guards & 403 Views)     |
+-----------------------------------------------------------------------------------+
```

---

### Stage 1: Automated E2E Regression (Playwright)

Start by executing the full automated test suite to confirm baseline functionality across all modules:

```cmd
cd PLAYWRIGHT
npx playwright test
```

For interactive debugging and visual step-by-step browser inspection:
```cmd
npx playwright test --ui
```

**Expected Result:**
- 16 out of 16 tests pass (`100% PASS`).
- Execution duration: ~22-25 seconds.
- Verified test suites:
  - `tests/attendance.spec.ts` (3 tests)
  - `tests/auth.spec.ts` (5 tests)
  - `tests/leave.spec.ts` (3 tests)
  - `tests/navigation.spec.ts` (3 tests)
  - `tests/profile-and-reports.spec.ts` (2 tests)

---

### Stage 2: Public Navigation & Authentication Boundaries

Open a fresh browser window at `http://localhost:4200`:

1. **Landing Page (`/`):**
   - Verify page title is `EMS — Workforce & Leave Management`.
   - Verify top header shows `EMS` logo badge and `Workforce Platform` subtitle.
   - Verify hero badge reads `Modern Workforce & Leave Management`.
   - Verify navigation links (`Features`, `How It Works`, `Role Benefits`) scroll smoothly.
   - Click **Sign In** in the top navigation bar. Verify route transitions to `/sign-in`.

2. **Sign-In Form Validation (`/sign-in`):**
   - Click the submit button with empty fields. Verify submit button remains disabled until valid input is entered.
   - Enter an invalid email format (e.g. `alex`). Verify inline validation message appears.
   - Enter invalid credentials (e.g., `alex.jones@company.com` / `WrongPass123`).
   - Verify an error banner appears stating invalid credentials.

3. **Sign-Up Guidance Page (`/sign-up`):**
   - Navigate to `/sign-up`.
   - Verify informational notice: *"EMS is an enterprise workforce management platform. All employee accounts are provisioned exclusively by your Human Resources department..."*
   - Click the **Return to Sign In** link.

4. **Direct URL Protection Check:**
   - While unauthenticated, attempt to paste `http://localhost:4200/dashboard` into the URL bar.
   - Verify immediate redirect back to `/sign-in` via `authGuard`.

---

### Stage 3: Employee Journey (Alex Jones)

Sign in with `alex.jones@company.com` / `Password123!`:

1. **Employee Dashboard (`/dashboard`):**
   - Verify the welcome greeting reads **Alex Jones**.
   - Inspect quick-stat cards:
     - Available Annual Leave Balance
     - Today's Attendance Status badge (Not Checked In / Checked In)
     - Pending Leave Requests counter
   - Verify quick action buttons: **Clock In / Out** and **Apply for Leave**.

2. **Daily Biometric Punch Simulation (`/attendance`):**
   - Navigate to **Attendance** from the sidebar or click **Clock In**.
   - If not checked in today, click the primary button: **Clock In**.
   - Verify immediate feedback: punch timestamp is recorded, status changes to `PRESENT`, and duration timer starts.
   - Click **Clock Out**. Verify clock-out timestamp is recorded and total working hours are computed and displayed.

3. **Attendance History (`/attendance/history`):**
   - Click the **Attendance History** tab or sidebar link.
   - Verify past attendance records are listed in reverse chronological order with date, check-in, check-out, duration, and status.

4. **Submit Attendance Regularization (`/attendance/corrections`):**
   - Click **Request Correction**.
   - Select a past date with a missing check-out or missed punch.
   - Provide revised check-in time (`09:00 AM`), check-out time (`05:30 PM`), and a business reason: *"Card reader malfunction at main reception."*
   - Submit the request. Verify request appears in the list with `PENDING` status.

5. **Leave Balances & Quotas (`/leaves`):**
   - Navigate to **Leaves** from the sidebar.
   - Verify the 4 policy cards:
     - **Annual Leave:** Total, Used, Available
     - **Sick Leave:** Total, Used, Available
     - **Casual Leave:** Total, Used, Available
     - **Maternity / Paternity Leave:** Total, Used, Available

6. **Submit Leave Application (`/leaves/apply` or Modal):**
   - Click **Apply for Leave**.
   - Select Leave Type: `Annual Leave`.
   - Select Date Range: Choose upcoming dates (e.g., 2 working days next week).
   - Verify duration auto-calculates to `2 days`.
   - Enter reason: *"Family commitment"*.
   - Click **Submit Application**.
   - Verify the leave appears under **Leave History** with status `PENDING`.
   - Verify available balance temporarily updates pending days.

7. **Team Leave Calendar (`/leaves/calendar`):**
   - Navigate to **Team Calendar**.
   - Verify calendar displays approved leaves for Engineering department peers.

8. **Self-Service Profile (`/profile`):**
   - Click the profile avatar in the header and select **My Profile** (or navigate to `/profile`).
   - Verify read-only official fields: Employee Code (`EMP004`), Department (`Engineering`), Designation (`Senior Engineer`).
   - Edit editable fields: Update phone number or emergency contact name.
   - Save changes and verify success notification.

9. **Verify Employee Permission Boundaries:**
   - Attempt to manually type `http://localhost:4200/departments` or `http://localhost:4200/reports` into the browser URL bar.
   - Verify immediate interception by `roleGuard` and redirect to `/unauthorized` (403 Access Restricted).

10. **Sign Out:**
    - Click **Sign Out** in the header. Verify session tokens and cookies are cleared and user is redirected to `/sign-in`.

---

### Stage 4: Manager Journey (David Miller)

Sign in with `manager@company.com` / `Password123!`:

1. **Manager Dashboard (`/dashboard`):**
   - Verify manager-scoped metrics:
     - Direct Reports Team Headcount (Engineering)
     - Today's Team Present Rate (%)
     - Pending Leave Requests counter
     - Pending Attendance Corrections counter

2. **Approve / Reject Leave Requests (`/leaves/approvals`):**
   - Navigate to **Leave Approvals**.
   - Locate the leave application submitted by Alex Jones in Stage 3.
   - Inspect applicant details, requested dates, leave type, and reason.
   - Click **Approve**. Confirm dialog.
   - Verify the request disappears from the pending queue and transitions to `APPROVED`.
   - *(Optional Test)* For a different request, click **Reject**, enter required rejection reason (*"Critical project milestone delivery"*), and submit.

3. **Attendance Regularization Decisions (`/attendance/corrections`):**
   - Navigate to **Attendance Corrections**.
   - Find Alex Jones's regularization request submitted in Stage 3.
   - Click **Approve**.
   - Verify the correction audit record updates to `APPROVED` and attendance record is regularized.

4. **Team Attendance Roll Call (`/attendance/daily`):**
   - Check daily roll call to see real-time status of all Engineering team members (Present, Absent, On Leave).

5. **Department Leave Calendar (`/leaves/calendar`):**
   - Confirm Alex Jones's approved leave now renders on the department calendar view.

6. **Sign Out:**
   - Sign out of David Miller's session.

---

### Stage 5: HR & Admin Journey (John Admin)

Sign in with `admin@company.com` / `Password123!`:

1. **Executive Organization Dashboard (`/dashboard`):**
   - Verify organization-wide KPIs:
     - Total Active Workforce
     - Total Departments
     - Organization Attendance Average
     - Open HR Tasks & Quotas

2. **Department Management (`/departments`):**
   - Navigate to **Departments**.
   - Verify listed departments (Engineering, Human Resources, Finance, Marketing).
   - Click **Add Department**.
   - Enter Name: `Quality Assurance`, Code: `QA`, Manager: `David Miller`.
   - Click **Save**. Verify new department appears in the active list.
   - Click **Edit** on a department and toggle its status.

3. **Employee Directory & Onboarding (`/employees`):**
   - Navigate to **Employees**.
   - Search by name: Type `Alex` -> Verify instant search filtering.
   - Filter by Department: Select `Engineering` -> Verify only engineering staff display.
   - Click **New Employee** (`/employees/new`).
   - Fill in onboarding form:
     - First Name: `Test`, Last Name: `Worker`
     - Work Email: `test.worker@company.com`
     - Department: `Quality Assurance`
     - Designation: `QA Automation Engineer`
     - Role: `EMPLOYEE`
     - Manager: `David Miller`
     - Joining Date: Today's date
   - Submit form. Verify new employee record is created, user credentials provisioned, and default leave quotas allocated.

4. **Leave Policy Configuration (`/leave-configuration`):**
   - Navigate to **Leave Policies**.
   - Inspect policy parameters: Annual Leave (15 days), Sick Leave (10 days), Casual Leave (7 days).
   - Edit an existing policy (e.g. increase Casual quota or toggle Carry-Forward flag).
   - Save and verify persistence.

5. **Quota Adjustments with Audit Log (`/leave-configuration/allocations`):**
   - Navigate to **Leave Allocations**.
   - Select employee `Alex Jones` and leave type `Annual Leave`.
   - Adjust balance (e.g., add 2 bonus days).
   - Enter mandatory justification: *"Annual performance reward bonus"*.
   - Save adjustment.
   - Verify the change is recorded in the **Immutable Audit Trail** table with Admin name, timestamp, delta, and justification.

6. **Workforce Analytics & Reporting (`/reports`):**
   - Navigate to **Reports & Analytics**.
   - Inspect reports:
     - Department Headcount distribution chart
     - Monthly Attendance Trends & Regularization rates
     - Leave Utilization & Balance Liability by department
   - Export report or filter by date range.

---

### Stage 6: Security, Guard Rails & RBAC Boundary Tests

Execute these edge-case tests to guarantee strict security compliance:

| Test Case | Steps | Expected Behavior |
|---|---|---|
| **Public Auth Redirection** | Authenticate as any user. Attempt to manually navigate to `http://localhost:4200/sign-in`. | Intercepted by `publicAuthGuard` and redirected back to `/dashboard`. |
| **Unauthorized Role Route** | Authenticate as `alex.jones@company.com` (`EMPLOYEE`). Manually navigate to `/leave-configuration`. | Intercepted by `roleGuard` and routed to `/unauthorized` (403 forbidden). |
| **Direct Gateway Header Spoofing** | Use cURL or Postman to send `GET http://localhost:8080/api/v1/employees` with forged header `X-User-Role: ADMIN`. | Gateway strips incoming client `X-User-*` headers; rejects request or enforces JWT identity. |
| **Tampered JWT Cookie** | Edit the `AUTH-TOKEN` cookie in browser DevTools to invalid string and refresh. | Gateway JWT filter rejects invalid signature; user is logged out and redirected to `/sign-in`. |
| **Clean Logout Invalidation** | Click **Sign Out**. Press browser **Back** button. | Protected pages cannot be loaded from cache; user is redirected to `/sign-in`. |

---

## 5. Backend REST API Direct Testing (cURL / Postman)

A pre-configured Postman collection is available at [docs/Employee-Management-System.postman_collection.json](file:///e:/079_data/develop/guvi-miniproject/docs/Employee-Management-System.postman_collection.json).

You can also test key endpoints via command line cURL:

### 1. Edge Authentication & Cookie Receipt
```bash
curl -i -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"admin@company.com\",\"password\":\"Password123!\"}"
```
*Expected: HTTP 200 OK, `Set-Cookie: AUTH-TOKEN=...; HttpOnly; SameSite=Lax`, and user JSON payload.*

### 2. Department Directory (Via Gateway with Cookie)
```bash
curl -i -X GET http://localhost:8080/api/v1/departments \
  --cookie "AUTH-TOKEN=<YOUR_JWT_TOKEN>"
```
*Expected: HTTP 200 OK with JSON array of active departments.*

### 3. Current User Attendance Status
```bash
curl -i -X GET http://localhost:8080/api/v1/attendance/today \
  --cookie "AUTH-TOKEN=<YOUR_JWT_TOKEN>"
```
*Expected: HTTP 200 OK with today's punch records or null if not yet punched.*

---

## 6. Troubleshooting & Diagnostics

If any service or test fails during the sequence, consult these diagnostic steps:

1. **Inspect Microservice Runtime Logs:**
   - Logs for all services are written to: `microservices/runtime-logs/`
   - Example: `microservices/runtime-logs/Employee-Management-Service.log`
   - Errors: `microservices/runtime-logs/*_error.log`

2. **Port Conflicts:**
   - If a port (e.g. `8080` or `8081`) is already occupied:
     ```cmd
     microservices\3-stop-all-services.bat --no-pause
     ```
   - Then re-launch via `microservices\2-start-all-services.bat --no-pause`.

3. **Reset Database to Clean State:**
   - If test records need to be wiped and re-seeded:
     ```cmd
     "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot employee_management_db < database\schema.sql
     "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot employee_management_db < database\seed.sql
     ```

4. **Rebuild Microservice JARs:**
   - If code modifications were made:
     ```cmd
     microservices\0-rebuild-jars.bat --no-pause
     ```

---

## 7. Clean Teardown

When testing is complete, terminate background services cleanly:

```cmd
microservices\3-stop-all-services.bat --no-pause
```
*Stops all background processes listening on ports `8761`, `8080`, `8081`, `8082`, `8083`, and `8084`.*
