import { describe, expect, it } from 'vitest';
import { Department } from '../../core/models/employee.models';
import * as DepartmentActions from './department.actions';
import { departmentReducer, initialDepartmentState } from './department.reducer';

describe('Department Reducer', () => {
  it('should set loading to true on loadDepartments', () => {
    const state = departmentReducer(initialDepartmentState, DepartmentActions.loadDepartments());
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should populate departments and set loading false on loadDepartmentsSuccess', () => {
    const departments: Department[] = [
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

    const state = departmentReducer(
      initialDepartmentState,
      DepartmentActions.loadDepartmentsSuccess({ departments })
    );

    expect(state.loading).toBe(false);
    expect(state.departments.length).toBe(1);
    expect(state.departments[0].code).toBe('ENG');
  });

  it('should set error and loading false on loadDepartmentsFailure', () => {
    const state = departmentReducer(
      initialDepartmentState,
      DepartmentActions.loadDepartmentsFailure({ error: 'Failed to load' })
    );

    expect(state.loading).toBe(false);
    expect(state.error).toBe('Failed to load');
  });
});
