# WorkPulse - Enterprise Employee Management & Leave Tracking System

An enterprise-grade, reactive microservices human capital management and leave tracking platform architected with **Java 17, Spring Boot 4.x, Spring WebFlux, Spring Cloud Gateway, Netflix Eureka, R2DBC MySQL, Angular 21, NgRx, Tailwind CSS 4, and Vitest**.

---

## 1. Overview & PRD Scope

WorkPulse provides an end-to-end organizational governance and self-service platform for enterprise workforces. The system enforces strict organizational role boundaries, automated daily attendance calculation, leave entitlement management with immutable audit logs, real-time KPI intelligence, and role-scoped access control.

### Implemented PRD Scope:
- **Service Discovery & Routing:** Eureka service registry and Spring Cloud Gateway with coordinated 5-second circuit breakers.
- **Security & RBAC:** Stateful JWT session issued via HttpOnly cookies, verified and stripped at Gateway, and propagated downstream via trusted internal security headers (`X-User-Id`, `X-User-Role`, `X-User-Email`, `X-Employee-Id`).
- **Department Administration:** Complete CRUD for organizational business units, leadership assignments, active/inactive filtering, and deactivation conflict checks (`/departments`).
- **Employee Lifecycle:** Directory filtering, HR provisioning, role assignment, and automatic quota allocation (`/employees`).
- **Secure Self-Service Profile:** Authenticated employees can manage personal contact details while sensitive employment data remains read-only (`/profile`).
- **Attendance Management:** Daily check-in/out, biometric punch simulation, automated hours calculation, and auditable correction workflows (`/attendance`).
- **Leave Policy Configuration:** Administrative leave-type creation, yearly quotas, carry-forward rules, and activation toggling (`/leave-configuration`).
- **Leave Allocation Governance:** Administrative quota adjustment with mandatory business justification and immutable audit logging (`/leave-configuration/allocations`).
- **Role-Scoped Balances:** Server-side IDOR prevention ensuring employees view only personal balances, managers view only direct reports, and HR/Admin view organization-wide data (`/leaves`).
- **Auditable Decision Workflows:** Mandatory rejection justification, approver tracking, self-approval prevention, and transactional quota deduction.
- **Reporting Analytics:** Personalized dashboards and KPI metrics for Employee, Manager, and HR roles (`/dashboard`, `/reports`).

---

## 2. Technology Stack & Versions

- **Java Development Kit (JDK):** OpenJDK 17
- **Backend Framework:** Spring Boot 4.1.1 (Reactive WebFlux, Spring Security, Spring Data R2DBC)
- **Service Discovery:** Spring Cloud Netflix Eureka Server 2024.0.0
- **API Gateway:** Spring Cloud Gateway 2024.0.0 with Resilience4j
- **Database Engine:** MySQL 8.x with R2DBC MySQL reactive driver
- **Frontend Framework:** Angular 21.2.17 (Standalone architecture)
- **State Management:** NgRx 21.1.1 (Store, Effects, Selectors)
- **CSS Framework:** Tailwind CSS 4.1.12
- **Testing Suites:** JUnit 5, Mockito, Reactor Test (`StepVerifier`), Vitest 4.0.8, `@vitest/coverage-v8`
- **Node.js & npm:** Node 24.13.0, npm 11.6.2

---

## 3. Architecture & Service Port Registry

```
                                  +------------------------------------+
                                  |   Angular 21 Client Application    |
                                  |    (employee-management-ui:4200)   |
                                  +-----------------+------------------+
                                                    |
                                          HTTP / CORS with Cookie
                                                    v
                                  +------------------------------------+
                                  |    Spring Cloud API Gateway        |
                                  |    (Employee-API-Gateway:8080)     |
                                  +-----------------+------------------+
                                                    |
            +----------------------+----------------+----------------------+----------------------+
            |                      |                                       |                      |
            v                      v                                       v                      v
+-----------------------+ +-----------------------+       +-----------------------+ +-----------------------+
|  Employee-Management  | | Attendance-Management |       |   Leave-Management    | |  Reporting-Dashboard  |
|     Service:8081      | |     Service:8082      |       |     Service:8083      | |     Service:8084      |
+-----------+-----------+ +-----------+-----------+       +-----------+-----------+ +-----------+-----------+
            |                         |                               |                         |
            +-------------------------+-------------------------------+-------------------------+
                                      | R2DBC Reactive MySQL Driver
                                      v
                        +---------------------------+
                        |  MySQL Database (Port 3306)
                        |  employee_management_db   |
                        +---------------------------+
```

| Service Name | Port | Directory Path | Core Responsibilities |
|---|---|---|---|
| **Employee-Service-Registry** | **8761** | `C:\Users\CM13500\Employee-Service-Registry` | Eureka Service Registry and discovery server |
| **Employee-API-Gateway** | **8080** | `C:\Users\CM13500\Employee-API-Gateway` | API Gateway, JWT verification, header stripping, circuit breakers |
| **Employee-Management-Service** | **8081** | `C:\Users\CM13500\Employee-Management-Service` | Authentication, Employee lifecycle, Department administration, Self-profile |
| **Attendance-Management-Service** | **8082** | `C:\Users\CM13500\Attendance-Management-Service` | Daily punch, work hours calculation, attendance corrections, audit trail |
| **Leave-Management-Service** | **8083** | `C:\Users\CM13500\Leave-Management-Service` | Leave policies, quotas, balance allocation, approvals, team calendar |
| **Reporting-Dashboard-Service** | **8084** | `C:\Users\CM13500\Reporting-Dashboard-Service` | KPI metrics, aggregated employee/manager/HR dashboard analytics |
| **Frontend UI** | **4200** | `C:\Users\CM13500\AngularProjects\employee-management-ui` | Angular 21 Single Page Application, NgRx Store, Tailwind CSS |

---

## 4. Security & Role-Based Access Control (RBAC)

### Trusted-Header Security Architecture
1. **Client to Gateway:** The Angular application transmits authentication credentials via an `HttpOnly` cookie or Bearer token.
2. **Gateway Ingress:** Gateway filters strip any incoming `X-User-*` headers from external clients to prevent spoofing.
3. **Gateway JWT Validation:** The Gateway validates the JWT signature, extracts user claims, and injects trusted internal headers:
   - `X-User-Id`: User account identifier
   - `X-User-Role`: Granted authority (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`)
   - `X-User-Email`: User principal email
   - `X-Employee-Id`: Associated employee record identifier
4. **Downstream Services:** Microservices trust only headers injected by the Gateway and construct a `RequestUser` security principal for method-level authorization (`@PreAuthorize`).

### RBAC Permission Matrix

| Feature / Resource | EMPLOYEE | MANAGER | HR | ADMIN |
|---|---|---|---|---|
| View Personal Dashboard & Balances | Allowed | Allowed | Allowed | Allowed |
| Daily Check-in / Check-out | Allowed | Allowed | Allowed | Allowed |
| Apply for Personal Leave | Allowed | Allowed | Allowed | Allowed |
| Request Personal Attendance Correction | Allowed | Allowed | Allowed | Allowed |
| Update Personal Contact Profile | Allowed | Allowed | Allowed | Allowed |
| View Direct Report Balances & Calendar | Denied | Allowed | Allowed | Allowed |
| Approve Direct Report Leaves & Corrections | Denied | Allowed | Allowed | Allowed |
| Department Administration | Denied | Denied | Full Access | Full Access |
| Leave-Type Configuration | Denied | Denied | Full Access | Full Access |
| Employee Quota Allocation & Adjustment | Denied | Denied | Full Access | Full Access |
| Employee Lifecycle Onboarding & Deactivation | Denied | Denied | Full Access | Full Access |
| Organization-Wide Reports & Analytics | Denied | Denied | Full Access | Full Access |

---

## 5. Angular Frontend Routes & Architecture

All Angular components strictly observe the mandatory **4-file component architecture** (`.ts`, `.html`, `.css`, `.spec.ts`).

| Route | Component | Guard / Access | Description |
|---|---|---|---|
| `/` | `LandingComponent` | Public | Landing page with product overview and demo quick-access |
| `/sign-in` | `SignInComponent` | `publicAuthGuard` | User login with demo credential quick-fill |
| `/auth/account-access` | `SignUpComponent` | `publicAuthGuard` | Enterprise account provisioning guidance page |
| `/auth/forgot-password` | `ForgotPasswordComponent` | `publicAuthGuard` | Self-service password reset simulation |
| `/dashboard` | `DashboardComponent` | `authGuard` | Role-adaptive dashboard (Employee / Manager / HR views) |
| `/employees` | `EmployeeListComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Filterable employee directory |
| `/employees/new` | `EmployeeFormComponent` | `roleGuard(['ADMIN', 'HR'])` | HR employee onboarding form |
| `/employees/:id` | `EmployeeDetailComponent` | `authGuard` | Detailed employee employment card |
| `/employees/:id/edit` | `EmployeeFormComponent` | `roleGuard(['ADMIN', 'HR'])` | Edit employee employment details |
| `/departments` | `DepartmentsComponent` | `roleGuard(['ADMIN', 'HR'])` | Department CRUD, active filtering, leadership assignment |
| `/leave-configuration` | `LeaveConfigurationComponent` | `roleGuard(['ADMIN', 'HR'])` | Leave policy types, annual quotas, carry-forward settings |
| `/leave-configuration/allocations`| `LeaveAllocationsComponent`| `roleGuard(['ADMIN', 'HR'])` | Employee quota adjustments and immutable audit history |
| `/attendance` | `AttendanceDashboardComponent` | `authGuard` | Daily attendance punch and status |
| `/attendance/history` | `AttendanceHistoryComponent` | `authGuard` | Monthly attendance logs and records |
| `/attendance/corrections` | `AttendanceCorrectionsComponent` | `authGuard` | Submit and review attendance corrections |
| `/leaves` | `LeaveDashboardComponent` | `authGuard` | Leave balances, application drawer, and history |
| `/leaves/approvals` | `ApprovalQueueComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Review pending leave requests |
| `/leaves/calendar` | `TeamCalendarComponent` | `authGuard` | Department team leave schedule |
| `/reports` | `ReportsComponent` | `roleGuard(['ADMIN', 'HR', 'MANAGER'])` | Attendance and leave analytics |
| `/profile` | `ProfileComponent` | `authGuard` | Self-service contact update & password change |

---

## 6. Database Setup & Schema

Ensure MySQL 8.x is running on localhost:3306. Execute the following standard safe commands:

```powershell
# Create database and apply DDL schema
mysql -u root -e "CREATE DATABASE IF NOT EXISTS employee_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root employee_management_db < "C:\Users\CM13500\database\schema.sql"

# Apply initial seed data
mysql -u root employee_management_db < "C:\Users\CM13500\database\seed.sql"
```

### Key Database Tables:
1. `users`: Credentials, BCrypt password hashes, account status, roles.
2. `departments`: Business unit name, code, leadership manager ID, `is_active` status.
3. `employees`: Profiles, contact details, department, manager, employment status.
4. `attendance_records`: Date, daily check-in time, check-out time, total working hours, status.
5. `attendance_audit_logs`: Audit logs for check-in/out and correction decisions.
6. `leave_types`: Policy code, name, description, annual quota, carry-forward flag, `is_active` status.
7. `leave_balances`: Yearly quota allocations, used days, pending days, available days.
8. `leave_requests`: Leave applications, date ranges, reasons, status, decision notes.
9. `leave_balance_adjustments`: Immutable audit trail for administrative allocation adjustments.

---

## 7. Standard Safe Startup & Shutdown Instructions

### Startup Order (Strictly Follow Sequential Order):
1. **MySQL Server 8.x** (Port 3306)
2. **Employee-Service-Registry** (Port 8761) - Wait until Eureka is UP
3. **Employee-Management-Service** (Port 8081)
4. **Attendance-Management-Service** (Port 8082)
5. **Leave-Management-Service** (Port 8083)
6. **Reporting-Dashboard-Service** (Port 8084)
7. **Employee-API-Gateway** (Port 8080)
8. **Angular Frontend** (Port 4200)

### Safe Startup Commands:
```powershell
# 1. Registry
cd C:\Users\CM13500\Employee-Service-Registry
mvn spring-boot:run

# 2. Employee Service
cd C:\Users\CM13500\Employee-Management-Service
mvn spring-boot:run

# 3. Attendance Service
cd C:\Users\CM13500\Attendance-Management-Service
mvn spring-boot:run

# 4. Leave Service
cd C:\Users\CM13500\Leave-Management-Service
mvn spring-boot:run

# 5. Reporting Service
cd C:\Users\CM13500\Reporting-Dashboard-Service
mvn spring-boot:run

# 6. Gateway
cd C:\Users\CM13500\Employee-API-Gateway
mvn spring-boot:run

# 7. Frontend
cd C:\Users\CM13500\AngularProjects\employee-management-ui
npm start
```

### Safe Shutdown:
To terminate processes safely, press `Ctrl + C` in each terminal window. Do not force-terminate system processes.

---

## 8. Build, Test, and Coverage Verification

### Backend Verification:
Run standard Maven clean test commands in each service:
```powershell
# Employee Service
cd C:\Users\CM13500\Employee-Management-Service
mvn clean test

# Leave Service
cd C:\Users\CM13500\Leave-Management-Service
mvn clean test

# Attendance Service
cd C:\Users\CM13500\Attendance-Management-Service
mvn clean test
```

### Frontend Verification:
```powershell
cd C:\Users\CM13500\AngularProjects\employee-management-ui

# Run full Vitest test suite (80 test files, 283 tests)
npm test

# Run code coverage report
npx ng test --coverage

# Run production build
npm run build
```

---

## 9. Test Results & Metrics Summary

- **Backend Test Pass Rate:** **100%**
  - `Employee-Management-Service`: 19 tests executed, 0 failures, 0 errors
  - `Leave-Management-Service`: 12 tests executed, 0 failures, 0 errors
  - `Attendance-Management-Service`: 11 tests executed, 0 failures, 0 errors
- **Frontend Test Pass Rate:** **100%** (80 test files passed, 283 tests passed)
- **Frontend Statement Coverage:** 76.94%
- **Frontend Branch Coverage:** 65.66%
- **Frontend Line Coverage:** 79.14%
- **Frontend Function Coverage:** 48.19%
- **Production Build:** Success (`472.12 kB` raw, `125.87 kB` estimated transfer size)

---

## 10. Demo Accounts & Credentials

Default password for all demo accounts: **`Password123!`**

| User Name | Email | Role | Department | Key Capabilities |
|---|---|---|---|---|
| **John Admin** | `admin@company.com` | `ADMIN` | Human Resources | Full system administration, departments, allocations, reports |
| **Sarah Jenkins** | `hr@company.com` | `HR` | Human Resources | Employee directory, leave configuration, quota adjustments |
| **David Miller** | `manager@company.com` | `MANAGER` | Engineering | Team calendar, direct report approvals, manager dashboard |
| **Alex Jones** | `alex.jones@company.com` | `EMPLOYEE` | Engineering | Punch in/out, leave application, personal profile editing |
| **Sarah Smith** | `sarah.smith@company.com` | `EMPLOYEE` | Engineering | Attendance tracking, time-off requests |

---

## 11. Delivery Package Contents

The final delivery ZIP archive `WorkPulse-Final-Delivery.zip` contains:
- `Employee-Service-Registry/` (Discovery Server source)
- `Employee-API-Gateway/` (API Gateway & Security source)
- `Employee-Management-Service/` (Employee & Department domain service)
- `Attendance-Management-Service/` (Attendance tracking domain service)
- `Leave-Management-Service/` (Leave & Allocation domain service)
- `Reporting-Dashboard-Service/` (Analytics & KPI domain service)
- `employee-management-ui/` (Angular 21 frontend source with 80/80 spec correspondence)
- `database/` (`schema.sql` and `seed.sql`)
- `README.md` (System architectural and operational setup guide)
- `PRD-TRACEABILITY.md` (Traceability matrix)
- `openapi.json` (OpenAPI 3.0 specification)
- `Employee-Management-System.postman_collection.json` (Postman API collection)
*(Generated build artifacts such as `target/`, `node_modules/`, `dist/`, `.git`, and sensitive credentials have been strictly excluded).*
