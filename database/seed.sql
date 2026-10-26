-- ====================================================================
-- Employee Management & Leave Tracking System - Seed Data
-- ====================================================================

USE employee_management_db;

-- 1. Seed Roles
INSERT INTO roles (role_id, role_name, description, created_at, updated_at) VALUES
(1, 'ADMIN', 'System Administrator with complete access to all resources', NOW(6), NOW(6)),
(2, 'HR', 'Human Resources manager for employee lifecycle, departments and organization metrics', NOW(6), NOW(6)),
(3, 'MANAGER', 'Team Manager responsible for direct reports, attendance approvals and leave reviews', NOW(6), NOW(6)),
(4, 'EMPLOYEE', 'Standard Employee with self-service attendance, profile and leave management', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE description = VALUES(description), updated_at = NOW(6);

-- 2. Seed Departments
INSERT INTO departments (department_id, name, code, description, manager_id, is_active, created_at, updated_at) VALUES
(1, 'Engineering', 'ENG', 'Software engineering, cloud infrastructure and product platform', 3, TRUE, NOW(6), NOW(6)),
(2, 'Human Resources', 'HR', 'Talent acquisition, employee wellness, payroll and people operations', 2, TRUE, NOW(6), NOW(6)),
(3, 'Operations', 'OPS', 'Business continuity, compliance, logistics and service operations', 3, TRUE, NOW(6), NOW(6)),
(4, 'Sales & Marketing', 'SALES', 'Revenue generation, enterprise accounts and digital marketing', 3, TRUE, NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE description = VALUES(description), is_active = VALUES(is_active), updated_at = NOW(6);

-- 3. Seed Users
-- Password for all seed users is: Password123!
-- BCrypt: $2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e
INSERT INTO users (user_id, email, password_hash, role, status, last_login_at, created_at, updated_at) VALUES
(1, 'admin@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'ADMIN', 'ACTIVE', NOW(6), NOW(6), NOW(6)),
(2, 'hr@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'HR', 'ACTIVE', NOW(6), NOW(6), NOW(6)),
(3, 'manager@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'MANAGER', 'ACTIVE', NOW(6), NOW(6), NOW(6)),
(4, 'alex.jones@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'EMPLOYEE', 'ACTIVE', NOW(6), NOW(6), NOW(6)),
(5, 'sarah.smith@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'EMPLOYEE', 'ACTIVE', NOW(6), NOW(6), NOW(6)),
(6, 'emily.brown@company.com', '$2a$10$w8Tfh11O7GZ8v7rTjY.v.OUq8b4MupE3cvyk2O6GZ6w7wD.E.cK2e', 'HR', 'ACTIVE', NOW(6), NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE role = VALUES(role), status = VALUES(status), updated_at = NOW(6);

-- 4. Seed Employees
INSERT INTO employees (employee_id, user_id, employee_code, first_name, last_name, email, phone, department_id, designation, joining_date, employment_status, manager_id, address, emergency_contact, created_at, updated_at) VALUES
(1, 1, 'EMP001', 'John', 'Admin', 'admin@company.com', '+1-555-0101', 2, 'System Administrator', '2022-01-15', 'ACTIVE', NULL, '100 Enterprise Way, Suite 400, New York, NY', '+1-555-9001 (Spouse)', NOW(6), NOW(6)),
(2, 2, 'EMP002', 'Sarah', 'Jenkins', 'hr@company.com', '+1-555-0102', 2, 'HR Director', '2022-03-01', 'ACTIVE', 1, '240 Madison Ave, New York, NY', '+1-555-9002 (Sister)', NOW(6), NOW(6)),
(3, 3, 'EMP003', 'David', 'Miller', 'manager@company.com', '+1-555-0103', 1, 'Engineering Manager', '2022-06-15', 'ACTIVE', 1, '55 Tech Boulevard, San Francisco, CA', '+1-555-9003 (Brother)', NOW(6), NOW(6)),
(4, 4, 'EMP004', 'Alex', 'Jones', 'alex.jones@company.com', '+1-555-0104', 1, 'Senior Software Engineer', '2023-02-10', 'ACTIVE', 3, '789 Market Street, San Francisco, CA', '+1-555-9004 (Parent)', NOW(6), NOW(6)),
(5, 5, 'EMP005', 'Sarah', 'Smith', 'sarah.smith@company.com', '+1-555-0105', 1, 'QA Automation Lead', '2023-04-18', 'ACTIVE', 3, '432 Silicon Ave, San Jose, CA', '+1-555-9005 (Partner)', NOW(6), NOW(6)),
(6, 6, 'EMP006', 'Emily', 'Brown', 'emily.brown@company.com', '+1-555-0106', 2, 'Talent Specialist', '2023-08-01', 'ACTIVE', 2, '150 5th Avenue, New York, NY', '+1-555-9006 (Mother)', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE designation = VALUES(designation), manager_id = VALUES(manager_id), updated_at = NOW(6);

-- 5. Seed Leave Types
INSERT INTO leave_types (leave_type_id, code, name, description, annual_quota, is_carry_forward, is_active, created_at, updated_at) VALUES
(1, 'CASUAL', 'Casual Leave', 'Short-term personal time off and unplanned casual leave', 12, FALSE, TRUE, NOW(6), NOW(6)),
(2, 'SICK', 'Sick Leave', 'Medical rest, personal illness and health appointments', 10, FALSE, TRUE, NOW(6), NOW(6)),
(3, 'EARNED', 'Earned Leave', 'Accrued annual vacation and privilege leave', 18, TRUE, TRUE, NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE annual_quota = VALUES(annual_quota), is_carry_forward = VALUES(is_carry_forward), is_active = VALUES(is_active), updated_at = NOW(6);

-- 6. Seed Leave Balances for 2026
INSERT INTO leave_balances (balance_id, employee_id, leave_type_id, year, total_days, used_days, pending_days, available_days, created_at, updated_at) VALUES
-- EMP001 (Admin)
(1, 1, 1, 2026, 12.0, 1.0, 0.0, 11.0, NOW(6), NOW(6)),
(2, 1, 2, 2026, 10.0, 0.0, 0.0, 10.0, NOW(6), NOW(6)),
(3, 1, 3, 2026, 18.0, 2.0, 0.0, 16.0, NOW(6), NOW(6)),
-- EMP002 (Sarah Jenkins)
(4, 2, 1, 2026, 12.0, 2.0, 0.0, 10.0, NOW(6), NOW(6)),
(5, 2, 2, 2026, 10.0, 1.0, 0.0, 9.0, NOW(6), NOW(6)),
(6, 2, 3, 2026, 18.0, 4.0, 0.0, 14.0, NOW(6), NOW(6)),
-- EMP003 (David Miller)
(7, 3, 1, 2026, 12.0, 3.0, 0.0, 9.0, NOW(6), NOW(6)),
(8, 3, 2, 2026, 10.0, 0.0, 0.0, 10.0, NOW(6), NOW(6)),
(9, 3, 3, 2026, 18.0, 5.0, 0.0, 13.0, NOW(6), NOW(6)),
-- EMP004 (Alex Jones)
(10, 4, 1, 2026, 12.0, 2.0, 1.0, 9.0, NOW(6), NOW(6)),
(11, 4, 2, 2026, 10.0, 1.0, 0.0, 9.0, NOW(6), NOW(6)),
(12, 4, 3, 2026, 18.0, 3.0, 2.0, 13.0, NOW(6), NOW(6)),
-- EMP005 (Sarah Smith)
(13, 5, 1, 2026, 12.0, 1.0, 0.0, 11.0, NOW(6), NOW(6)),
(14, 5, 2, 2026, 10.0, 2.0, 0.0, 8.0, NOW(6), NOW(6)),
(15, 5, 3, 2026, 18.0, 2.0, 0.0, 16.0, NOW(6), NOW(6)),
-- EMP006 (Emily Brown)
(16, 6, 1, 2026, 12.0, 0.0, 0.0, 12.0, NOW(6), NOW(6)),
(17, 6, 2, 2026, 10.0, 0.0, 0.0, 10.0, NOW(6), NOW(6)),
(18, 6, 3, 2026, 18.0, 0.0, 0.0, 18.0, NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE available_days = VALUES(available_days), used_days = VALUES(used_days), updated_at = NOW(6);

-- 7. Seed Attendance Records (Recent past dates and current status)
INSERT INTO attendance_records (attendance_id, employee_id, attendance_date, check_in_time, check_out_time, total_hours, status, created_at, updated_at) VALUES
(1, 4, '2026-10-19', '2026-10-19 09:02:15', '2026-10-19 17:34:20', 8.53, 'PRESENT', NOW(6), NOW(6)),
(2, 4, '2026-10-20', '2026-10-20 08:58:10', '2026-10-20 18:02:45', 9.07, 'PRESENT', NOW(6), NOW(6)),
(3, 4, '2026-10-21', '2026-10-21 09:15:00', '2026-10-21 17:45:00', 8.50, 'PRESENT', NOW(6), NOW(6)),
(4, 5, '2026-10-19', '2026-10-19 09:05:00', '2026-10-19 17:30:00', 8.42, 'PRESENT', NOW(6), NOW(6)),
(5, 5, '2026-10-20', '2026-10-20 09:00:00', '2026-10-20 13:00:00', 4.00, 'HALF_DAY', NOW(6), NOW(6)),
(6, 5, '2026-10-21', '2026-10-21 08:55:00', '2026-10-21 17:55:00', 9.00, 'PRESENT', NOW(6), NOW(6)),
(7, 3, '2026-10-21', '2026-10-21 08:45:00', '2026-10-21 18:15:00', 9.50, 'PRESENT', NOW(6), NOW(6)),
(8, 2, '2026-10-21', '2026-10-21 09:00:00', '2026-10-21 17:30:00', 8.50, 'PRESENT', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE total_hours = VALUES(total_hours), status = VALUES(status), updated_at = NOW(6);

-- 8. Seed Attendance Audit Logs
INSERT INTO attendance_audit_logs (audit_id, attendance_id, employee_id, action, previous_status, new_status, reason, performed_by, created_at) VALUES
(1, 1, 4, 'CHECK_IN', NULL, 'PRESENT', 'Biometric / System Check-in', 'alex.jones@company.com', '2026-10-19 09:02:15'),
(2, 1, 4, 'CHECK_OUT', 'PRESENT', 'PRESENT', 'Regular workday check-out', 'alex.jones@company.com', '2026-10-19 17:34:20'),
(3, 5, 5, 'CHECK_OUT', 'PRESENT', 'HALF_DAY', 'Half-day doctor visit approved', 'david.miller@company.com', '2026-10-20 13:00:00')
ON DUPLICATE KEY UPDATE reason = VALUES(reason);

-- 9. Seed Leave Requests
INSERT INTO leave_requests (leave_request_id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approver_id, approver_comments, decision_date, created_at, updated_at) VALUES
(1, 4, 1, '2026-10-05', '2026-10-06', 2.0, 'Personal family commitment in hometown', 'APPROVED', 3, 'Approved. Please coordinate sprint deliverables with Sarah.', '2026-10-02 11:30:00', NOW(6), NOW(6)),
(2, 4, 2, '2026-10-14', '2026-10-14', 1.0, 'Severe seasonal migraine', 'APPROVED', 3, 'Take rest. Get well soon.', '2026-10-14 10:15:00', NOW(6), NOW(6)),
(3, 4, 3, '2026-11-16', '2026-11-17', 2.0, 'Annual family holiday trip', 'PENDING', 3, NULL, NULL, NOW(6), NOW(6)),
(4, 5, 1, '2026-11-02', '2026-11-02', 1.0, 'Vehicle registration and legal paperwork', 'PENDING', 3, NULL, NULL, NOW(6), NOW(6)),
(5, 5, 3, '2026-09-15', '2026-09-16', 2.0, 'Attending regional tech conference', 'APPROVED', 3, 'Approved for technical training credit.', '2026-09-10 14:00:00', NOW(6), NOW(6)),
(6, 6, 1, '2026-09-22', '2026-09-22', 1.0, 'Unplanned urgent personal leave', 'CANCELLED', 2, 'Cancelled by requester.', '2026-09-21 16:00:00', NOW(6), NOW(6))
ON DUPLICATE KEY UPDATE status = VALUES(status), approver_comments = VALUES(approver_comments), updated_at = NOW(6);

-- 10. Seed Notification Logs
INSERT INTO notification_logs (notification_id, recipient_email, recipient_id, subject, message, type, status, created_at) VALUES
(1, 'alex.jones@company.com', 4, 'Leave Request Approved', 'Your Casual Leave request for 2026-10-05 to 2026-10-06 has been approved by David Miller.', 'LEAVE_APPROVAL', 'SENT', NOW(6)),
(2, 'manager@company.com', 3, 'New Leave Application Pending Review', 'Alex Jones submitted an Earned Leave application for 2026-11-16 to 2026-11-17.', 'LEAVE_APPLICATION', 'SENT', NOW(6)),
(3, 'manager@company.com', 3, 'New Leave Application Pending Review', 'Sarah Smith submitted a Casual Leave application for 2026-11-02 to 2026-11-02.', 'LEAVE_APPLICATION', 'SENT', NOW(6))
ON DUPLICATE KEY UPDATE status = VALUES(status);
