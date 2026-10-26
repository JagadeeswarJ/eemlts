import { describe, expect, it } from 'vitest';
import { Department } from '../../core/models/employee.models';
import * as DepartmentActions from './department.actions';

describe('Department Actions', () => {
  it('should create loadDepartments action', () => {
    const action = DepartmentActions.loadDepartments();
    expect(action.type).toBe('[Department] Load Departments');
  });

  it('should create loadDepartmentsSuccess action with payload', () => {
    const departments: Department[] = [
      {
        departmentId: 1,
        name: 'Engineering',
        code: 'ENG',
        description: 'Software',
        managerId: 3,
        managerName: 'David Miller',
        employeeCount: 4,
      },
    ];
    const action = DepartmentActions.loadDepartmentsSuccess({ departments });
    expect(action.type).toBe('[Department] Load Departments Success');
    expect(action.departments.length).toBe(1);
  });

  it('should create loadDepartmentsFailure action with error', () => {
    const action = DepartmentActions.loadDepartmentsFailure({ error: 'Network error' });
    expect(action.type).toBe('[Department] Load Departments Failure');
    expect(action.error).toBe('Network error');
  });
});
