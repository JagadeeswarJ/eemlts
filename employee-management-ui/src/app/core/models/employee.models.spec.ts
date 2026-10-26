import { describe, expect, it } from 'vitest';
import {
  CreateDepartmentRequest,
  CreateEmployeeRequest,
  Department,
  Employee,
  ManagerOption,
  UpdateDepartmentRequest,
  UpdateSelfProfileRequest,
} from './employee.models';

describe('Employee Models', () => {
  it('should instantiate valid Employee model', () => {
    const emp: Employee = {
      employeeId: 4,
      userId: 4,
      employeeCode: 'EMP004',
      firstName: 'Alex',
      lastName: 'Jones',
      fullName: 'Alex Jones',
      email: 'alex@company.com',
      phone: '+1-555-0104',
      departmentId: 1,
      departmentName: 'Engineering',
      designation: 'Senior Engineer',
      joiningDate: '2023-02-10',
      employmentStatus: 'ACTIVE',
      managerId: 3,
      managerName: 'David Miller',
      address: 'Market St',
      emergencyContact: 'Sister',
      role: 'EMPLOYEE',
      createdAt: '',
      updatedAt: '',
    };
    expect(emp.employeeCode).toBe('EMP004');
    expect(emp.employmentStatus).toBe('ACTIVE');
  });

  it('should instantiate valid Department model with isActive', () => {
    const dept: Department = {
      departmentId: 1,
      name: 'Engineering',
      code: 'ENG',
      description: 'Software development',
      managerId: 3,
      managerName: 'David Miller',
      employeeCount: 4,
      isActive: true,
    };
    expect(dept.code).toBe('ENG');
    expect(dept.employeeCount).toBe(4);
    expect(dept.isActive).toBe(true);
  });

  it('should instantiate CreateDepartmentRequest and UpdateDepartmentRequest', () => {
    const createReq: CreateDepartmentRequest = {
      name: 'Legal',
      code: 'LEG',
      description: 'Legal operations',
      managerId: 1,
    };
    expect(createReq.code).toBe('LEG');

    const updateReq: UpdateDepartmentRequest = {
      name: 'Legal Affairs',
      code: 'LEG',
    };
    expect(updateReq.name).toBe('Legal Affairs');
  });

  it('should instantiate UpdateSelfProfileRequest', () => {
    const selfReq: UpdateSelfProfileRequest = {
      phone: '+1-555-9999',
      address: '789 Pine Ave',
      emergencyContact: 'Mom - +1-555-8888',
    };
    expect(selfReq.phone).toBe('+1-555-9999');
  });

  it('should instantiate valid ManagerOption model', () => {
    const mgr: ManagerOption = {
      employeeId: 3,
      employeeCode: 'EMP003',
      fullName: 'David Miller',
      email: 'manager@company.com',
      designation: 'Engineering Manager',
      departmentName: 'Engineering',
    };
    expect(mgr.employeeId).toBe(3);
  });
});
