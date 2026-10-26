import { describe, expect, it } from 'vitest';
import { Employee } from '../../core/models/employee.models';
import * as EmployeeActions from './employee.actions';
import { employeeReducer, initialEmployeeState } from './employee.reducer';

describe('employeeReducer', () => {
  it('should update employees list on loadEmployeesSuccess', () => {
    const mockEmployees: Employee[] = [
      {
        employeeId: 1,
        userId: 1,
        employeeCode: 'EMP001',
        firstName: 'John',
        lastName: 'Admin',
        fullName: 'John Admin',
        email: 'admin@company.com',
        phone: '123',
        departmentId: 1,
        departmentName: 'HR',
        designation: 'Admin',
        joiningDate: '2022-01-01',
        employmentStatus: 'ACTIVE',
        managerId: null,
        managerName: '',
        address: 'NY',
        emergencyContact: 'Mom',
        role: 'ADMIN',
        createdAt: '',
        updatedAt: '',
      },
    ];

    const action = EmployeeActions.loadEmployeesSuccess({
      response: {
        content: mockEmployees,
        page: 0,
        size: 10,
        totalElements: 1,
        totalPages: 1,
        isFirst: true,
        isLast: true,
      },
    });

    const state = employeeReducer(initialEmployeeState, action);

    expect(state.employees.length).toBe(1);
    expect(state.totalElements).toBe(1);
    expect(state.loading).toBe(false);
  });

  it('should mark employee as INACTIVE on deactivateEmployeeSuccess', () => {
    const populatedState = {
      ...initialEmployeeState,
      employees: [
        {
          employeeId: 4,
          userId: 4,
          employeeCode: 'EMP004',
          firstName: 'Alex',
          lastName: 'Jones',
          fullName: 'Alex Jones',
          email: 'alex@company.com',
          phone: '123',
          departmentId: 1,
          departmentName: 'ENG',
          designation: 'Dev',
          joiningDate: '2023-01-01',
          employmentStatus: 'ACTIVE' as const,
          managerId: null,
          managerName: '',
          address: '',
          emergencyContact: '',
          role: 'EMPLOYEE' as const,
          createdAt: '',
          updatedAt: '',
        },
      ],
    };

    const action = EmployeeActions.deactivateEmployeeSuccess({ id: 4 });
    const state = employeeReducer(populatedState, action);

    expect(state.employees[0].employmentStatus).toBe('INACTIVE');
  });
});
