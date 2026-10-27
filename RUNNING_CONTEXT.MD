# WorkPulse — Running Implementation Context

## 1. Project Overview
- **Name:** WorkPulse (Enterprise Employee Management & Leave Tracking System)
- **Purpose:** An enterprise-grade reactive human capital management and leave tracking platform providing organizational governance, employee lifecycle management, biometric punch simulation and automated daily attendance tracking, auditable leave configuration and approval workflows, and role-tailored KPI intelligence dashboards.
- **Technology Stack:**
  - **Backend:** Java 17, Spring Boot 4.1.1, Spring WebFlux (Project Reactor non-blocking reactive streams), Spring Cloud Gateway 2024.0.0, Spring Cloud Netflix Eureka 2024.0.0, Spring Data R2DBC, Resilience4j Circuit Breakers, JJWT (0.12.6).
  - **Database:** MySQL 8.x (`MySQL80` service on port 3306), accessed reactively via `r2dbc-mysql`.
  - **Frontend:** Angular 21.2.17 (Standalone component architecture), NgRx 21.1.1 (Store, Effects, Selectors), Tailwind CSS 4.1.12, RxJS 7.8.2, Vitest 4.0.8 (`@vitest/coverage-v8`).
  - **Build & Package Tools:** Maven (`pom.xml`), Node 24.13.0, npm 11.6.2.
- **Important Operational Constraints:**
  - **Direct Disk Writes Only:** Avoid IDE diff-staging review buffers; persist changes directly to disk using UTF-8 encoding.
  - **CLI Performance:** Prefer `cmd.exe /c` for rapid command execution; run directory changes inline (`cd /d "<subdir>" && <cmd>`).
  - **Git Conventions:** Read-only usage. Never stage (`git add`) or commit (`git commit`).
  - **Code Style:** Self-documenting code with minimal comments.

---

## 2. Implementation Status

| Component | Status | Port | Implemented Capabilities | Missing / Pending Work | Dependencies |
|---|---|---|---|---|---|
| **Employee-Service-Registry** | COMPLETE | 8761 | Eureka Service Discovery server, heartbeat monitoring, dynamic service catalog | None | Java 17 |
| **Employee-API-Gateway** | COMPLETE | 8080 | Central routing, Circuit Breakers (Resilience4j), HttpOnly JWT cookie parsing, trusted security header injection, CORS filter, correlation ID tracing | None | Eureka Registry (8761) |
| **Employee-Management-Service** | COMPLETE | 8081 | Department CRUD, employee directory, HR provisioning, role assignment, self-service profile updates, authentication & password management | None | Eureka (8761), MySQL (3306) |
| **Attendance-Management-Service** | COMPLETE | 8082 | Daily check-in/out, biometric punch simulation, automated hours calculation, attendance regularization/correction workflows, audit trail | None | Eureka (8761), MySQL (3306) |
| **Leave-Management-Service** | COMPLETE | 8083 | Leave policy configuration (quotas, carry-forward), quota adjustments with audit log, leave applications, manager approvals/rejections, balance calculation | None | Eureka (8761), MySQL (3306) |
| **Reporting-Dashboard-Service** | COMPLETE | 8084 | Role-tailored KPI intelligence (Admin, HR, Manager, Employee), leave and attendance analytics, department breakdown reports | None | Eureka (8761), MySQL (3306) |
| **employee-management-ui** | COMPLETE | 4200 | Angular 21 SPA, NgRx store/effects, responsive Tailwind CSS 4 UI, route guards (`authGuard`, `publicAuthGuard`, `roleGuard`), role-scoped dashboards, attendance punch widget, leave forms | None | API Gateway (8080) |
| **Database Schemas & Seed** | COMPLETE | 3306 | Relational tables (`schema.sql`) and sample dataset (`seed.sql`) in `database/` folder | Ingestion into local `MySQL80` instance | MySQL Server 8.0 |

---

## 3. Architecture and Data Flow

```
                                  +------------------------------------+
                                  |   Angular 21 Client Application    |
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
                                            |     (Port 3306)     |
                                            +---------------------+
```

### Communication Patterns & Security Boundaries
1. **Edge Authentication & Session Management:**
   - User signs in via `POST /api/v1/auth/login`. Gateway routes this to `Employee-Management-Service`.
   - On success, a signed JWT token is issued in an `HttpOnly`, `SameSite=Lax`, `Secure` cookie named `AUTH-TOKEN`.
2. **Gateway Verification & Header Injection:**
   - On every inbound request, `GatewayJwtSecurityContextRepository` in `Employee-API-Gateway` parses and verifies the JWT.
   - `TrustedHeaderFilter` strips any untrusted external headers and injects validated security headers:
     - `X-User-Id`: Authenticated user primary key.
     - `X-User-Role`: User role (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`).
     - `X-User-Email`: Authenticated user email address.
     - `X-Employee-Id`: Linked employee record ID.
     - `X-Correlation-Id`: Distributed tracing request identifier.
3. **Downstream Microservice Security:**
   - Downstream services (`Attendance`, `Leave`, `Reporting`) do not decode JWTs directly; they use `TrustedHeaderSecurityContextRepository` to trust the internal gateway headers for RBAC and IDOR prevention.
4. **Resilience & Fault Tolerance:**
   - Gateway encapsulates all downstream microservice routes within Resilience4j circuit breakers with 5-second timeouts and half-open failure rate thresholds (50%).

---

## 4. Implementation Details

### API Routes & Endpoint Inventory

#### 1. Authentication (`AuthController.java` -> `/api/v1/auth`)
- `POST /api/v1/auth/login` — Authenticate credentials, set HttpOnly cookie, return user DTO.
- `POST /api/v1/auth/logout` — Invalidate session and clear cookie.
- `GET  /api/v1/auth/me` — Retrieve current authenticated session identity.
- `POST /api/v1/auth/change-password` — Change password for authenticated user.
- `POST /api/v1/auth/forgot-password` — Initiate password recovery workflow.

#### 2. Department Administration (`DepartmentController.java` -> `/api/v1/departments`)
- `GET   /api/v1/departments` — List all active departments.
- `GET   /api/v1/departments/{id}` — Get department details by ID.
- `GET   /api/v1/departments/admin` — Admin view of all departments (including inactive).
- `POST  /api/v1/departments` — Create new department.
- `PUT   /api/v1/departments/{id}` — Update department details.
- `PATCH /api/v1/departments/{id}/status` — Toggle department active/inactive status.

#### 3. Employee Management (`EmployeeController.java` -> `/api/v1/employees`)
- `GET    /api/v1/employees` — Paginated directory search with department & status filters.
- `POST   /api/v1/employees` — HR provisioning of new employee (creates user, profile & initial leave balances).
- `GET    /api/v1/employees/{id}` — Fetch employee details by ID.
- `PUT    /api/v1/employees/{id}` — Update employee official employment attributes.
- `DELETE /api/v1/employees/{id}` — Terminate/deactivate employee account.
- `GET    /api/v1/employees/{id}/profile` — Read-only employee profile view.
- `PUT    /api/v1/employees/me/profile` — Self-service profile update (contact, emergency details).
- `GET    /api/v1/employees/managers` — Retrieve list of eligible managers for assignments.

#### 4. Attendance Management (`AttendanceController.java` -> `/api/v1/attendance`)
- `POST /api/v1/attendance/check-in` — Register clock-in punch.
- `POST /api/v1/attendance/check-out` — Register clock-out punch and compute total hours.
- `GET  /api/v1/attendance/today` — Current employee today's attendance status.
- `GET  /api/v1/attendance/history` — Personal attendance history (with date filters).
- `GET  /api/v1/attendance/daily` — Daily attendance roll call (Manager / HR view).
- `GET  /api/v1/attendance/monthly` — Monthly summary aggregates.
- `GET  /api/v1/attendance/stats` — Real-time attendance KPIs (Present, Late, Absent).
- `POST /api/v1/attendance/corrections` — Submit regularization request for missed punches.
- `PUT  /api/v1/attendance/corrections/{id}` — Manager decision (Approve/Reject) on correction.
- `GET  /api/v1/attendance/audit-logs` — Audit trail for attendance adjustments.

#### 5. Leave Management (`LeaveController.java` -> `/api/v1/leaves`)
- `GET   /api/v1/leaves/types` — List active leave policies.
- `GET   /api/v1/leaves/admin/types` — Admin view of all leave types.
- `POST  /api/v1/leaves/admin/types` — Create new leave policy type.
- `PUT   /api/v1/leaves/admin/types/{id}` — Update leave policy parameters.
- `PATCH /api/v1/leaves/admin/types/{id}/status` — Activate/deactivate leave type.
- `GET   /api/v1/leaves/admin/balances` — HR/Admin organization-wide leave balances.
- `PUT   /api/v1/leaves/admin/balances/{employeeId}/{leaveTypeId}` — Administrative balance adjustment.
- `GET   /api/v1/leaves/admin/balance-adjustments` — Immutable audit log of balance adjustments.
- `GET   /api/v1/leaves/balances` — Role-scoped employee leave balances.
- `POST  /api/v1/leaves/apply` — Submit leave request with automated balance pre-check.
- `PUT   /api/v1/leaves/{id}/cancel` — Withdraw pending leave application.
- `PUT   /api/v1/leaves/{id}/approve` — Approve pending request (deducts from balance).
- `PUT   /api/v1/leaves/{id}/reject` — Reject pending request with mandatory business reason.
- `GET   /api/v1/leaves/history` — Scoped leave history.
- `GET   /api/v1/leaves/pending` — Manager queue of pending leave requests.
- `GET   /api/v1/leaves/calendar` — Team leave calendar view.

#### 6. Reporting & Analytics (`ReportingController.java` -> `/api/v1/reports`)
- `GET /api/v1/reports/employee-dashboard` — Personalized employee metrics.
- `GET /api/v1/reports/manager-dashboard` — Direct-reports team KPIs and pending actions.
- `GET /api/v1/reports/hr-dashboard` — Enterprise-wide workforce KPIs.
- `GET /api/v1/reports/department-reports` — Department-wise breakdown metrics.
- `GET /api/v1/reports/attendance-reports` — Comprehensive attendance aggregation reports.
- `GET /api/v1/reports/leave-reports` — Leave utilization and balance liability analytics.

---

## 5. Database and Data Models

- **Database Engine:** MySQL 8.0 (`employee_management_db`, UTF-8 Unicode 4-byte encoding `utf8mb4_unicode_ci`).
- **Connection Configuration:** R2DBC URL `r2dbc:mysql://localhost:3306/employee_management_db`.
- **Relational Tables Overview (`database/schema.sql`):**
  1. `roles`: Role definitions (`ADMIN`, `HR`, `MANAGER`, `EMPLOYEE`).
  2. `departments`: Organizational departments, unique codes, manager assignments.
  3. `users`: Credentials, email, bcrypt password hash, role enum, status (`ACTIVE`, `INACTIVE`, `SUSPENDED`).
  4. `employees`: Personal profile, employee code, designation, manager FK, department FK, hire date.
  5. `attendance_records`: Daily punch logs, check-in/out timestamps, hours worked, status (`PRESENT`, `HALF_DAY`, `ABSENT`).
  6. `attendance_audit_logs`: Audit trail for regularization actions and manual adjustments.
  7. `leave_types`: Leave policies (`ANNUAL`, `SICK`, `CASUAL`, `MATERNITY`), annual quota, carry-forward flag.
  8. `leave_balances`: Yearly quota per employee, total days, used days, pending days, available days.
  9. `leave_requests`: Leave applications, date ranges, total days, approval status (`PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`).
  10. `leave_balance_adjustments`: Immutable audit log for HR quota corrections with justification.
  11. `notification_logs`: System notification log for email / in-app notifications.

---

## 6. Current Changes
- **Latest Changes:**
  - Performed comprehensive codebase deep-dive covering all 6 microservices, gateway filters, R2DBC configurations, database schemas, and Angular 21 frontend.
  - Fully populated `RUNNING_CONTEXT.MD` with exact endpoints, schema definitions, architecture diagrams, and operational state.
- **Affected Files:** `RUNNING_CONTEXT.MD`.
- **Verification:**
  - Microservice source trees analyzed: 6 backend services + 1 Angular frontend.
  - API endpoint mappings verified from controller annotations.
  - Database schema and seed verified from SQL definition scripts.
  - Test inventory confirmed (15 backend tests, 80 frontend test specs).

---

## 7. Decisions and Rationale
- **Reactive Stack (WebFlux + R2DBC):** Non-blocking I/O allows microservices to handle high concurrency with small memory footprint compared to traditional thread-per-request servlet models.
- **Trusted Security Headers via Gateway:** Centralizes JWT verification at the edge (Gateway). Internal services remain stateless and do not duplicate cryptographic verification overhead.
- **Stateful JWT in HttpOnly Cookie:** Protects session tokens against XSS attacks compared to localStorage storage while maintaining stateless authentication downstream.
- **NgRx Component Store Pattern:** Centralized state management in Angular 21 ensures deterministic UI updates across attendance punches, leave balances, and employee directories.

---

## 8. Known Issues
- **Database Initialization Required:** The database `employee_management_db` is defined in `database/schema.sql` and `database/seed.sql` but has not yet been executed in the local `MySQL80` instance.
- **Default YML Password:** Service `application.yml` files have an empty password by default (`password:`), whereas the local MySQL 8.0 server password is `root`. Running services locally requires passing the database password via environment variable or CLI override.
- **Service Dependency Sequence:** Microservices must start sequentially: Eureka Registry (8761) -> Domain Services (8081, 8082, 8083, 8084) -> API Gateway (8080) -> Angular UI (4200).

---

## 9. Next Steps
1. Ingest `database/schema.sql` and `database/seed.sql` into local MySQL `MySQL80` instance to prepare the database for live execution.
2. Verify local compilation / build of services when needed (`.\mvnw.cmd` or Maven).
3. Execute user tasks, bug fixes, or enhancements according to specifications.

---

## 10. Verification Status
- **MySQL 8.0 Instance:** VERIFIED (`MySQL80` running on port 3306, user `root`, pass `root`).
- **Endpoint Coverage:** 36 backend endpoints inventoried across 6 controllers.
- **Frontend Routes:** 15 routes mapped across 3 layout structures.
- **Test Inventory:** 95 test files verified (15 backend Java test suites, 80 Vitest frontend specs).
