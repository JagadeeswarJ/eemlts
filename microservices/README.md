# EMS — Microservices Architecture & Operations

This directory contains the 6 Spring Boot 4.x / Spring Cloud reactive microservices that power the **EMS** enterprise platform.

## Microservices Overview

| Microservice | Port | Tech Stack | Responsibilities |
|---|---|---|---|
| **Employee-Service-Registry** | `8761` | Spring Cloud Netflix Eureka | Dynamic discovery server & heartbeat registration |
| **Employee-API-Gateway** | `8080` | Spring Cloud Gateway, Resilience4j, WebFlux | Central edge proxy, JWT verification, security header injection, CORS |
| **Employee-Management-Service** | `8081` | Spring WebFlux, Spring Data R2DBC | User authentication, employee CRUD, department management |
| **Attendance-Management-Service** | `8082` | Spring WebFlux, Spring Data R2DBC | Daily punch simulation, hours calculation, attendance regularization |
| **Leave-Management-Service** | `8083` | Spring WebFlux, Spring Data R2DBC | Leave policies, quotas, allocations, manager approvals, team calendar |
| **Reporting-Dashboard-Service** | `8084` | Spring WebFlux, Spring Data R2DBC | Role-based KPI analytics and aggregated departmental reporting |

---

## Single-Source Database Configuration (`database.yml`)

All database-backed services (`Employee`, `Attendance`, `Leave`, `Reporting`) import database parameters from:

📁 **`microservices/database.yml`**:
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

Services import this file via Spring Boot's `spring.config.import`:
```yaml
spring:
  config:
    import:
      - "optional:file:../database.yml"
      - "optional:file:./microservices/database.yml"
      - "optional:file:./database.yml"
```

To update credentials, host, or connection pool parameters across the entire system, update `database.yml` once.

---

## Batch Lifecycle Scripts

- **`0-delete-targets.bat`**: Force-deletes all `target` build directories across all services.
- **`0-rebuild-jars.bat`**: Sequential Maven clean packaging (`mvn clean package -DskipTests`).
- **`2-start-all-services.bat`**: Launches all 6 microservices in parallel with logs redirected to `runtime-logs/`.
- **`3-stop-all-services.bat`**: Port-based graceful termination of all microservice processes (`8761`, `8080`, `8081`, `8082`, `8083`, `8084`).
