-- ====================================================================
-- Employee Management & Leave Tracking System - Database Schema
-- Database: employee_management_db
-- ====================================================================

CREATE DATABASE IF NOT EXISTS employee_management_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE employee_management_db;

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    role_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    department_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(255),
    manager_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_departments_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Users Table
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    last_login_at DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role),
    INDEX idx_users_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Employees Table
CREATE TABLE IF NOT EXISTS employees (
    employee_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(25) NOT NULL,
    department_id BIGINT NOT NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    employment_status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    manager_id BIGINT NULL,
    address VARCHAR(255) NOT NULL,
    emergency_contact VARCHAR(50) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_employees_email (email),
    INDEX idx_employees_code (employee_code),
    INDEX idx_employees_dept (department_id),
    INDEX idx_employees_manager (manager_id),
    INDEX idx_employees_status (employment_status),
    CONSTRAINT fk_employees_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_employees_department FOREIGN KEY (department_id) REFERENCES departments(department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add self-referencing manager foreign key safely
-- (can be added if table already exists or via constraint check)

-- 5. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time DATETIME(6) NOT NULL,
    check_out_time DATETIME(6) NULL,
    total_hours DECIMAL(5,2) DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PRESENT',
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_emp_att_date (employee_id, attendance_date),
    INDEX idx_att_date (attendance_date),
    INDEX idx_att_status (status),
    INDEX idx_att_employee (employee_id),
    CONSTRAINT fk_attendance_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Attendance Audit Logs Table
CREATE TABLE IF NOT EXISTS attendance_audit_logs (
    audit_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    attendance_id BIGINT NULL,
    employee_id BIGINT NOT NULL,
    action VARCHAR(50) NOT NULL,
    previous_status VARCHAR(50) NULL,
    new_status VARCHAR(50) NULL,
    reason VARCHAR(255) NULL,
    performed_by VARCHAR(100) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    INDEX idx_audit_employee (employee_id),
    INDEX idx_audit_attendance (attendance_id),
    CONSTRAINT fk_audit_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Leave Types Table
CREATE TABLE IF NOT EXISTS leave_types (
    leave_type_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255),
    annual_quota INT NOT NULL,
    is_carry_forward BOOLEAN NOT NULL DEFAULT FALSE,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Leave Balances Table
CREATE TABLE IF NOT EXISTS leave_balances (
    balance_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    year INT NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    used_days DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    pending_days DECIMAL(5,1) NOT NULL DEFAULT 0.0,
    available_days DECIMAL(5,1) NOT NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    UNIQUE KEY uk_emp_leave_year (employee_id, leave_type_id, year),
    INDEX idx_balances_employee (employee_id),
    INDEX idx_balances_year (year),
    CONSTRAINT fk_balances_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_balances_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Leave Requests Table
CREATE TABLE IF NOT EXISTS leave_requests (
    leave_request_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(5,1) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    approver_id BIGINT NULL,
    approver_comments VARCHAR(500) NULL,
    decision_date DATETIME(6) NULL,
    created_at DATETIME(6) NOT NULL,
    updated_at DATETIME(6) NOT NULL,
    INDEX idx_requests_employee (employee_id),
    INDEX idx_requests_status (status),
    INDEX idx_requests_dates (start_date, end_date),
    INDEX idx_requests_approver (approver_id),
    CONSTRAINT fk_requests_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_requests_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Notification Logs Table
CREATE TABLE IF NOT EXISTS notification_logs (
    notification_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recipient_email VARCHAR(255) NOT NULL,
    recipient_id BIGINT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SENT',
    created_at DATETIME(6) NOT NULL,
    INDEX idx_notification_recipient (recipient_email),
    INDEX idx_notification_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Leave Balance Adjustments Table
CREATE TABLE IF NOT EXISTS leave_balance_adjustments (
    adjustment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL,
    leave_type_id BIGINT NOT NULL,
    year INT NOT NULL,
    previous_total DECIMAL(5,1) NOT NULL,
    new_total DECIMAL(5,1) NOT NULL,
    reason VARCHAR(500) NOT NULL,
    performed_by VARCHAR(100) NOT NULL,
    performed_at DATETIME(6) NOT NULL,
    INDEX idx_adj_employee (employee_id),
    INDEX idx_adj_leave_type (leave_type_id),
    INDEX idx_adj_year (year),
    CONSTRAINT fk_adj_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id) ON DELETE CASCADE,
    CONSTRAINT fk_adj_leave_type FOREIGN KEY (leave_type_id) REFERENCES leave_types(leave_type_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
