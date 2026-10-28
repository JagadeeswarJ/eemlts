# EMS — Enterprise Human Capital & Leave System

An enterprise-grade, reactive microservices human capital management and leave tracking platform architected with **Java 17, Spring Boot 4.x, Spring WebFlux, Spring Cloud Gateway, Netflix Eureka, R2DBC MySQL, Angular 21, NgRx, Tailwind CSS 4, and Playwright**.

---

## 1. Executive Overview & Brand Identity

**EMS** delivers a unified, high-reliability workspace for modern enterprise organizations. It features automated daily attendance calculations, biometric punch simulation, auditable leave configuration and approvals with immutable audit trails, role-tailored KPI intelligence, and granular role-based access control.

### Amber Walnut Morning Design System
EMS is styled exclusively in the **Amber Walnut Morning** aesthetic, ensuring executive calm, high readability, and crisp contrast without visual noise:
- **Canvas / Background (`#EBEFEE`):** Crisp, calm morning mist background.
- **Warm Sand (`#CCB499`):** Subtle borders, badges, card accents, and secondary text.
- **Muted Terracotta (`#C8906D`):** Warm structural highlights, pending states, and intermediate badges.
- **Burnt Amber (`#BB6C43`):** Primary action buttons, active navigation indicators, and key focus states.
- **Dark Walnut (`#4A413C` / `#3E3530`):** Deep earthy text, executive hero headers, and solid sidebar navigation.
- **Zero Icon Packages & Zero Emojis:** Strictly no third-party icon libraries (FontAwesome, Lucide, Material) and zero emojis anywhere. 100% semantic inline SVG primitives and typography.

---

## 2. Architecture & Service Port Registry

```
                                  +------------------------------------+
                                  |      EMS Angular 21 Client         |
                                  |    (employee-management-ui:4200)   |
                                  +-----------------+------------------+
                                                    | HTTP / CORS with HttpOnly Cookie
                                                    v
                                  +------------------------------------+
                                  |    Spring Cloud API Gateway        |
                                  |    (Employee-API-Gateway:8080)     |
                                  +-----------------+------------------+
                                                    | Internal Routing via Eureka & Security Headers
            +----------------------+----------------+----------------------+----------------------+
            |                      |                                       |                      |
            v                      v                                       v                      v
+-----------------------+ +-----------------------+       +-----------------------+ +-----------------------+
|  Employee-Management  | | Attendance-Management |       |   Leave-Management    | |  Reporting-Dashboard  |
|     Service:8081      | |     Service:8082      |       |     Service:8083      | |     Service:8084      |
+-----------+-----------+ +-----------+-----------+       +-----------+-----------+ +-----------+-----------+
            \                      |                                       |                     /
             \                     |                                       |                    /
              +--------------------+-------------------+-------------------+-------------------+
                                                       |
                                                       v
                                            +---------------------+
                                            |   MySQL 8.0 R2DBC   |
                                            |  (employee_mgmt_db) |
                                            |     (Port 3306)     |
                                            +---------------------+
```

### Microservice Registry

| Service Name | Port | Directory Path | Core Responsibilities |
|---|---|---|---|
| **Employee-Service-Registry** | **8761** | `microservices/Employee-Service-Registry` | Eureka Service Registry and discovery server |
| **Employee-API-Gateway** | **8080** | `microservices/Employee-API-Gateway` | Central API Gateway, JWT verification, security header injection, circuit breakers, CORS |
| **Employee-Management-Service** | **8081** | `microservices/Employee-Management-Service` | Authentication, Employee lifecycle, Department administration, Self-profile |
| **Attendance-Management-Service** | **8082** | `microservices/Attendance-Management-Service` | Biometric clock-in/out simulation, work hours calculation, attendance regularization, audit logs |
| **Leave-Management-Service** | **8083** | `microservices/Leave-Management-Service` | Leave policies, quotas, balance allocation, approvals, team calendar |
| **Reporting-Dashboard-Service** | **8084** | `microservices/Reporting-Dashboard-Service` | Role-tailored KPI intelligence (Employee, Manager, HR dashboards) |
| **EMS Frontend UI** | **4200** | `employee-management-ui` | Angular 21 SPA, NgRx Store, Tailwind CSS 4, Amber Walnut Morning theme |
| **Playwright Test Suite** | N/A | `PLAYWRIGHT` | Chromium automated E2E test suite (16 tests, 100% pass) |

---

## 3. Single-Source Database Configuration

All microservices that persist data (`Employee-Management-Service`, `Attendance-Management-Service`, `Leave-Management-Service`, `Reporting-Dashboard-Service`) import their database credentials and R2DBC parameters from a **single source of truth**:

📂 **`microservices/database.yml`**:
```yaml
spring:
  r2dbc:
    url: r2dbc:mysql://localhost:3306/employee_management_db
    username: root
    password: ${DB_PASSWORD:root}
    pool:
      initial-size: 5
      max-size: 20
      max-idle-time: 30m
```

Each microservice's `src/main/resources/application.yml` automatically imports this shared file:
```yaml
spring:
  config:
    import:
      - "optional:file:../database.yml"
      - "optional:file:./microservices/database.yml"
      - "optional:file:./database.yml"
```
*Changing the database host, port, username, or password in `microservices/database.yml` immediately updates all microservices without modifying individual service configurations.*

---

## 4. Backend Lifecycle Batch Utilities

Windows CLI batch utilities are provided in `microservices/` for automated management:

| Utility Script | Description |
|---|---|
| **`microservices\0-delete-targets.bat`** | Force-deletes all Maven `target` folders across all microservices. Pass `--no-pause` for automated scripts. |
| **`microservices\0-rebuild-jars.bat`** | Clean packages all 6 microservices sequentially with Maven (`mvn clean package -DskipTests`). Pass `--no-pause` for CI/CD. |
| **`microservices\2-start-all-services.bat`** | Launches all 6 microservices in parallel, initializing Eureka first, redirecting logs to `microservices/runtime-logs/`. |
| **`microservices\3-stop-all-services.bat`** | Scans listening ports (`8761`, `8080`, `8081`, `8082`, `8083`, `8084`) and terminates processes cleanly. |

---

## 5. Security & Role-Based Access Control (RBAC)

### Trusted-Header Security Architecture
1. **Edge Authentication:** Users authenticate via `POST /api/v1/auth/login`. On verification, a signed JWT is issued in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `AUTH-TOKEN` and returned in the JSON payload.
2. **Gateway Ingress:** `GatewayJwtSecurityContextRepository` strips untrusted client headers and verifies the JWT signature.
3. **Trusted Header Propagation:** The Gateway injects verified internal headers for downstream consumption:
   - `X-User-Id`: Authenticated user primary key
   - `X-User-Role`: User role (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`)
   - `X-User-Email`: Authenticated user email address
   - `X-Employee-Id`: Linked employee record identifier
   - `X-Correlation-Id`: Distributed tracing request UUID
4. **Downstream Microservices:** Domain services trust only internal headers injected by the Gateway, preventing IDOR and external spoofing.
5. **CORS Architecture:** Gateway exposes a dedicated `CorsConfigurationSource` covering `http://localhost:4200` with full methods (`GET`, `POST`, `PUT`, `DELETE`, `PATCH`, `OPTIONS`), allowed headers (`*`), and credentials enabled (`allowCredentials: true`).

### RBAC Permission Matrix

| Feature / Resource | EMPLOYEE | MANAGER | HR | ADMIN |
|---|:---:|:---:|:---:|:---:|
| Personal Dashboard & Balances | Allowed | Allowed | Allowed | Allowed |
| Daily Clock-in / Clock-out | Allowed | Allowed | Allowed | Allowed |
| Apply for Personal Leave | Allowed | Allowed | Allowed | Allowed |
| Request Attendance Correction | Allowed | Allowed | Allowed | Allowed |
| Update Personal Contact Profile | Allowed | Allowed | Allowed | Allowed |
| View Direct Report Balances & Calendar | Denied | Allowed | Allowed | Allowed |
| Approve Direct Report Leaves & Corrections | Denied | Allowed | Allowed | Allowed |
| Department Administration | Denied | Denied | Full Access | Full Access |
| Leave-Type Configuration | Denied | Denied | Full Access | Full Access |
| Quota Allocation & Adjustment | Denied | Denied | Full Access | Full Access |
| Employee Lifecycle Onboarding & Offboarding | Denied | Denied | Full Access | Full Access |
| Organization-Wide Reports & Analytics | Denied | Denied | Full Access | Full Access |

---

## 6. Angular Frontend Architecture

The frontend is built on **Angular 21** using standalone components, reactive signals, and **NgRx** centralized state management.

### Key Route Inventory
| Route | Component | Access / Guard | Description |
|---|---|---|---|
| `/` | `LandingComponent` | Public (`publicAuthGuard`) | EMS marketing landing page |
| `/sign-in` | `SignInComponent` | Public (`publicAuthGuard`) | Secure sign-in form with quick demo access |
| `/sign-up` | `SignUpComponent` | Public (`publicAuthGuard`) | Enterprise account guidance |
| `/forgot-password` | `ForgotPasswordComponent` | Public (`publicAuthGuard`) | Password recovery flow |
| `/dashboard` | `DashboardComponent` | `authGuard` | Role-adaptive dashboard (Employee / Manager / HR) |
| `/employees` | `EmployeeListComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Filterable employee directory |
| `/employees/new` | `EmployeeFormComponent` | `roleGuard(['ADMIN', 'HR'])` | HR employee onboarding |
| `/employees/:id` | `EmployeeDetailComponent` | `authGuard` | Personnel dossier and employment details |
| `/employees/:id/edit` | `EmployeeFormComponent` | `roleGuard(['ADMIN', 'HR'])` | Edit employee profile |
| `/departments` | `DepartmentsComponent` | `roleGuard(['ADMIN', 'HR'])` | Department CRUD and leadership assignment |
| `/leave-configuration` | `LeaveConfigurationComponent` | `roleGuard(['ADMIN', 'HR'])` | Policy quotas and carry-forward rules |
| `/leave-configuration/allocations` | `LeaveAllocationsComponent` | `roleGuard(['ADMIN', 'HR'])` | Quota allocation adjustments & audit logs |
| `/attendance` | `AttendanceDashboardComponent` | `authGuard` | Biometric punch simulation & daily hours |
| `/attendance/history` | `AttendanceHistoryComponent` | `authGuard` | Attendance historical records |
| `/attendance/corrections` | `AttendanceCorrectionsComponent` | `authGuard` | Attendance regularization requests |
| `/leaves` | `LeaveDashboardComponent` | `authGuard` | Leave portal, quota balances, application modal |
| `/leaves/apply` | `LeaveApplicationComponent` | `authGuard` | Standalone leave application form |
| `/leaves/history` | `LeaveHistoryComponent` | `authGuard` | Time-off application history & status |
| `/leaves/approvals` | `ApprovalQueueComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Manager & HR approval queue |
| `/leaves/calendar` | `TeamCalendarComponent` | `authGuard` | Department team leave schedule |
| `/reports` | `ReportsComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Organization analytics & workforce reports |
| `/profile` | `ProfileComponent` | `authGuard` | Contact information update & password change |
| `/unauthorized` | `UnauthorizedComponent` | Public | 403 Access Restricted view |
| `**` | `NotFoundComponent` | Public | 404 Page Not Found view |

---

## 7. Automated Playwright Test Suite

The repository includes a complete end-to-end Playwright test suite located in `PLAYWRIGHT/tests/`:

### Test Coverage Summary (16 Tests — 100% Passing)
- **`tests/auth.spec.ts` (5 tests):**
  - Landing page loads with EMS branding and navigation to Sign-In
  - Sign-in form validation displays errors on empty / invalid inputs
  - Admin logs in and navigates to Admin Dashboard
  - Alex Jones (Employee) logs in and sees Employee View
  - Logout clears session and redirects back to sign-in
- **`tests/attendance.spec.ts` (3 tests):**
  - Employee navigates to Attendance Dashboard and views today status
  - Employee inspects attendance history records
  - Employee opens and inspects attendance corrections workflow
- **`tests/leave.spec.ts` (3 tests):**
  - Employee inspects leave balances and annual quotas
  - Employee navigates to leave application form
  - Manager David Miller inspects pending leave approvals queue
- **`tests/navigation.spec.ts` (3 tests):**
  - Unauthenticated user cannot access protected `/dashboard`
  - Employee accessing administrative route (`/departments`) gets redirected to `/unauthorized`
  - Admin user navigates through administrative modules (`/departments`, `/employees`, `/reports`)
- **`tests/profile-and-reports.spec.ts` (2 tests):**
  - User views personal profile and contact information
  - Manager accesses organization analytics and reports dashboard

```bash
cd PLAYWRIGHT
npx playwright test
```

---

## 8. Verified Demo Accounts & Credentials

Default password for all seed accounts: **`Password123!`**

| Name | Work Email | Role | Department | Key Capabilities |
|---|---|---|---|---|
| **John Admin** | `admin@company.com` | `ADMIN` | Human Resources | Full organizational administration, departments, allocations, reports |
| **Sarah Jenkins** | `hr@company.com` | `HR` | Human Resources | Employee directory, leave configuration, quota adjustments |
| **David Miller** | `manager@company.com` | `MANAGER` | Engineering | Direct report approvals, team calendar, manager dashboard |
| **Alex Jones** | `alex.jones@company.com` | `EMPLOYEE` | Engineering | Clock in/out, leave application, personal profile editing |
| **Sarah Smith** | `sarah.smith@company.com` | `EMPLOYEE` | Engineering | Daily attendance tracking, time-off requests |

---

## 9. Quickstart Guide

### Prerequisites
- Java 17 (JDK)
- MySQL 8.x running on port `3306` (service `MySQL80`, user `root`, password `root`)
- Node.js 20+ and npm

### Step 1: Database Setup
```cmd
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot -e "CREATE DATABASE IF NOT EXISTS employee_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot employee_management_db < database\schema.sql
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -proot employee_management_db < database\seed.sql
```

### Step 2: Build & Start Microservices
```cmd
microservices\0-rebuild-jars.bat --no-pause
microservices\2-start-all-services.bat --no-pause
```
*All 6 microservices will launch in parallel, automatically reading `microservices/database.yml`.*

### Step 3: Start EMS Frontend
```cmd
cd employee-management-ui
npm install
npm start
```
*Frontend will be accessible at `http://localhost:4200`.*

### Step 4: Run Playwright E2E Tests
```cmd
cd PLAYWRIGHT
npx playwright test
```

### Step 5: Stop Services Cleanly
```cmd
microservices\3-stop-all-services.bat --no-pause
```
