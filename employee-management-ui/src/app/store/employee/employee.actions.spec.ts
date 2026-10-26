import { describe, expect, it } from 'vitest';
import { CreateEmployeeRequest } from '../../core/models/employee.models';
import * as EmployeeActions from './employee.actions';

describe('Employee Actions', () => {
  it('should create loadEmployees action', () => {
    const action = EmployeeActions.loadEmployees({ params: { search: 'John' } });
    expect(action.type).toBe('[Employee] Load Employees');
    expect(action.params?.search).toBe('John');
  });

  it('should create createEmployee action', () => {
    const request: CreateEmployeeRequest = {
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@company.com',
      phone: '123',
      departmentId: 1,
      designation: 'Engineer',
      joiningDate: '2026-10-22',
      address: 'Street',
      emergencyContact: 'Contact',
    };
    const action = EmployeeActions.createEmployee({ request });
    expect(action.type).toBe('[Employee] Create Employee');
    expect(action.request.firstName).toBe('Jane');
  });

  it('should create deactivateEmployee action', () => {
    const action = EmployeeActions.deactivateEmployee({ id: 5 });
    expect(action.type).toBe('[Employee] Deactivate Employee');
    expect(action.id).toBe(5);
  });
});
