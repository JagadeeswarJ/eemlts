import { describe, expect, it } from 'vitest';
import { Department } from '../../core/models/employee.models';
import { DepartmentState } from './department.reducer';
import * as DepartmentSelectors from './department.selectors';

describe('Department Selectors', () => {
  const mockDepartments: Department[] = [
    {
      departmentId: 1,
      name: 'Engineering',
      code: 'ENG',
      description: 'Tech',
      managerId: 3,
      managerName: 'David Miller',
      employeeCount: 4,
    },
  ];

  const state: DepartmentState = {
    departments: mockDepartments,
    loading: false,
    error: null,
  };

  it('should select all departments', () => {
    const result = DepartmentSelectors.selectAllDepartments.projector(state);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Engineering');
  });

  it('should select loading state', () => {
    const result = DepartmentSelectors.selectDepartmentsLoading.projector(state);
    expect(result).toBe(false);
  });

  it('should select error state', () => {
    const result = DepartmentSelectors.selectDepartmentsError.projector(state);
    expect(result).toBeNull();
  });
});
