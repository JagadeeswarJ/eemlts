# EMS — Running Implementation Context

## 1. Project Overview
- **Product:** EMS (Employee Management System) — enterprise reactive workforce, attendance, and leave management platform.
- **Palette (Amber Walnut Morning):** Canvas `#EBEFEE`, Warm Sand `#CCB499`, Muted Terracotta `#C8906D`, Burnt Amber `#BB6C43`, Dark Walnut `#4A413C` / `#3E3530`. Inline SVG primitives only (no third-party icon libraries, no emojis).
- **Stack:** Java 17, Spring Boot 4.1.1, Spring WebFlux, Spring Cloud Gateway, Eureka Registry, Spring Data R2DBC, MySQL 8 (`employee_management_db`), Angular 21, NgRx 21, Tailwind CSS 4, Playwright 1.58.
- **Rules:** Direct disk writes only; execute CLI via `cmd.exe /c` with inline directory changes; git is read-only.

---

## 2. Implementation Status

| Component | Status | Port | Capabilities | Dependencies |
|---|---|---|---|---|
| **Employee-Service-Registry** | COMPLETE | 8761 | Eureka service discovery, dynamic catalog, heartbeats | Java 17 |
| **Employee-API-Gateway** | COMPLETE | 8080 | Edge routing, Resilience4j circuit breakers, JWT verification, trusted header injection, WebFlux CORS | Eureka (8761) |
| **Employee-Management-Service** | COMPLETE | 8081 | Auth (`/api/v1/auth`), Departments (`/api/v1/departments`), Employees (`/api/v1/employees`), Profiles | Eureka, MySQL (3306) |
| **Attendance-Management-Service** | COMPLETE | 8082 | Punch simulation (`/api/v1/attendance`), hours calculation, regularization, audit logs | Eureka, MySQL (3306) |
| **Leave-Management-Service** | COMPLETE | 8083 | Policies (`/api/v1/leaves/types`), balances, requests, manager approval queue, team calendar | Eureka, MySQL (3306) |
| **Reporting-Dashboard-Service** | COMPLETE | 8084 | Role-scoped KPI analytics (`/api/v1/reports` for Employee, Manager, HR, Admin) | Eureka, MySQL (3306) |
| **employee-management-ui** | COMPLETE | 4200 | Angular 21 SPA, NgRx store/effects, Amber Walnut Morning design, route guards (`auth`, `publicAuth`, `role`) | Gateway (8080) |
| **Database & Seed Data** | COMPLETE | 3306 | 11 relational tables (`schema.sql`) and sample enterprise seed data (`seed.sql`) | MySQL 8.0 |
| **Batch Lifecycle Utilities** | COMPLETE | N/A | `microservices/` batch scripts: `0-delete-targets.bat`, `0-rebuild-jars.bat`, `2-start-all-services.bat`, `3-stop-all-services.bat` | Windows cmd |
| **Playwright Test Suite** | COMPLETE | N/A | 16 E2E tests across 5 specs (`PLAYWRIGHT/tests/`), 100% passing | Chromium, UI, Gateway |

---

## 3. Architecture and Data Flow

```
Angular UI (4200) --[HTTP / HttpOnly JWT Cookie / CORS]--> API Gateway (8080)
                                                                 |
               +-------------------+--------------------+--------+-----------+
               | (Eureka: 8761)    | (Trusted Headers)  |                    |
               v                   v                    v                    v
     Employee-Service (8081) Attendance-Service (8082) Leave-Service (8083) Reports-Service (8084)
               +-------------------+--------------------+--------------------+
                                           |
                                           v
                             MySQL 8.0 R2DBC (3306: employee_management_db)
```

- **Security Flow:** Client authenticates via Gateway -> Employee Service issues signed JWT (HttpOnly cookie `AUTH-TOKEN`). Gateway validates JWT and forwards trusted headers downstream (`X-User-Id`, `X-User-Role`, `X-User-Email`, `X-Employee-Id`, `X-Correlation-Id`). Downstream services trust only gateway-injected internal headers.
- **Config Single Source:** All 4 persistence services import database credentials from `microservices/database.yml` via Spring Boot's `spring.config.import`.

---

## 4. Implementation Details

| Domain | Base Path | Core Endpoints & Logic |
|---|---|---|
| **Auth** | `/api/v1/auth` | `login` (JWT issuance & cookie), `logout`, `me` (session check), `change-password`, `forgot-password` |
| **Departments** | `/api/v1/departments` | CRUD, status toggling (`/status`), admin view, department head assignments |
| **Employees** | `/api/v1/employees` | Directory search, HR provisioning (`POST`), dossier (`{id}`), self-profile (`me/profile`), managers list |
| **Attendance** | `/api/v1/attendance` | Clock in/out (`check-in`, `check-out`), `today` status, `history`, `daily`/`monthly` aggregates, regularization `corrections`, `audit-logs` |
| **Leaves** | `/api/v1/leaves` | Policy types (`/types`), balances (`/balances`), `apply`, `approve`/`reject` (with balance adjustment), `calendar`, `pending` queue |
| **Reporting** | `/api/v1/reports` | `employee-dashboard`, `manager-dashboard`, `hr-dashboard`, `department-reports`, `attendance-reports`, `leave-reports` |

---

## 5. Database and Data Models
- **Database:** MySQL 8 (`employee_management_db`, `utf8mb4_unicode_ci`), R2DBC connection `r2dbc:mysql://localhost:3306/employee_management_db`.
- **Entities (11 tables):** `roles`, `departments`, `users` (credentials/BCrypt), `employees` (profile/links), `attendance_records` (clock times/hours), `attendance_audit_logs`, `leave_types` (quota rules), `leave_balances` (used/pending/available), `leave_requests` (workflow status), `leave_balance_adjustments` (audit trail), `notification_logs`.

---

## 6. Current Changes
- **Testing Guide & Sequential Protocol (`docs/TEST.md`):** Created comprehensive end-to-end testing manual detailing environment checks, service startup, seed credentials, 6-stage sequential test pipeline (Playwright baseline -> Public auth -> Employee journey -> Manager approvals -> Admin/HR governance -> Security & RBAC boundary tests), cURL/Postman verification, and troubleshooting diagnostics.
- **Tagline Modernization:** Replaced legacy "human capital" phrasing across index title, header badges, landing hero badges, sign-in/up copy, and documentation with clean, modern **Workforce & Leave Management** / **Workforce Operations** terminology.
- **Rebranding to `EMS`:** Standardized product branding from legacy names to **`EMS`** across all UI components, templates, route guards, tests, scripts, and documentation (`README.md`, `microservices/README.md`, `employee-management-ui/README.md`, `PLAYWRIGHT/README.md`, `docs/PRD-TRACEABILITY.md`, `docs/openapi.json`).
- **Single-Source Database Config:** Configured `microservices/database.yml` imported by all 4 persistence microservices; all 6 JARs packaged and running.
- **Build & E2E Verification:** Clean Angular production build (`npm run build`, 0 errors). 16/16 passing Playwright E2E tests (`npx playwright test`).

---

## 7. Decisions and Rationale
- **Concise Acronym (`EMS`):** Clean, standard enterprise naming without wordy branding or ambiguity.
- **Amber Walnut Morning Palette:** Executive warm aesthetics; eliminates eye strain and avoids generic corporate blue.
- **Zero Icon Packages / Zero Emojis:** Native inline SVGs prevent library drift, bundle bloat, and maintain consistent styling tokens.
- **Edge Header Propagation:** Authentication occurs once at Gateway; microservices rely on verified trusted headers to eliminate redundant JWT decryption and enforce RBAC.
- **Centralized `database.yml`:** Eliminates credential duplication across 4 separate service repositories.

---

## 8. Known Issues
- None. All microservices, Gateway CORS, Angular UI, database tables, and Playwright tests are passing with 100% verification.

---

## 9. Next Steps
- Staging / Docker containerization if requested.
- Maintain Eureka service registration monitoring.

---

## 10. Verification Status
- **MySQL 8.0 (`employee_management_db`):** VERIFIED (Service `MySQL80`, port 3306).
- **Microservices (6 Services):** VERIFIED & RUNNING (Eureka `8761`, Gateway `8080`, Employee `8081`, Attendance `8082`, Leave `8083`, Reports `8084`).
- **Frontend Server:** VERIFIED & RUNNING (Angular 21 on `http://localhost:4200`; production build clean, 0 errors).
- **Playwright Test Suite:** VERIFIED: 16/16 tests passing (100% pass rate in 21.7s).
