import { describe, expect, it } from 'vitest';
import { EmployeeState } from './employee.reducer';
import * as EmployeeSelectors from './employee.selectors';

describe('Employee Selectors', () => {
  const state: EmployeeState = {
    employees: [],
    selectedEmployee: null,
    departments: [],
    managers: [],
    totalElements: 15,
    totalPages: 2,
    currentPage: 0,
    pageSize: 10,
    loading: false,
    error: null,
    actionSuccess: false,
  };

  it('should select employees list', () => {
    const result = EmployeeSelectors.selectAllEmployees.projector(state);
    expect(result).toEqual([]);
  });

  it('should select pagination state', () => {
    expect(EmployeeSelectors.selectEmployeeTotalElements.projector(state)).toBe(15);
    expect(EmployeeSelectors.selectEmployeeTotalPages.projector(state)).toBe(2);
    expect(EmployeeSelectors.selectEmployeeCurrentPage.projector(state)).toBe(0);
  });
});
