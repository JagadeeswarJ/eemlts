import { createAction, props } from '@ngrx/store';
import { PagedResponse } from '../../core/models/auth.models';
import {
  CreateEmployeeRequest,
  Department,
  Employee,
  ManagerOption,
  UpdateEmployeeRequest,
} from '../../core/models/employee.models';

export const loadEmployees = createAction(
  '[Employee] Load Employees',
  props<{ params?: { departmentId?: number; status?: string; search?: string; page?: number; size?: number } }>()
);
export const loadEmployeesSuccess = createAction(
  '[Employee] Load Employees Success',
  props<{ response: PagedResponse<Employee> }>()
);
export const loadEmployeesFailure = createAction(
  '[Employee] Load Employees Failure',
  props<{ error: string }>()
);

export const loadEmployeeById = createAction(
  '[Employee] Load Employee By Id',
  props<{ id: number }>()
);
export const loadEmployeeByIdSuccess = createAction(
  '[Employee] Load Employee By Id Success',
  props<{ employee: Employee }>()
);
export const loadEmployeeByIdFailure = createAction(
  '[Employee] Load Employee By Id Failure',
  props<{ error: string }>()
);

export const createEmployee = createAction(
  '[Employee] Create Employee',
  props<{ request: CreateEmployeeRequest }>()
);
export const createEmployeeSuccess = createAction(
  '[Employee] Create Employee Success',
  props<{ employee: Employee }>()
);
export const createEmployeeFailure = createAction(
  '[Employee] Create Employee Failure',
  props<{ error: string }>()
);

export const updateEmployee = createAction(
  '[Employee] Update Employee',
  props<{ id: number; request: UpdateEmployeeRequest }>()
);
export const updateEmployeeSuccess = createAction(
  '[Employee] Update Employee Success',
  props<{ employee: Employee }>()
);
export const updateEmployeeFailure = createAction(
  '[Employee] Update Employee Failure',
  props<{ error: string }>()
);

export const deactivateEmployee = createAction(
  '[Employee] Deactivate Employee',
  props<{ id: number }>()
);
export const deactivateEmployeeSuccess = createAction(
  '[Employee] Deactivate Employee Success',
  props<{ id: number }>()
);
export const deactivateEmployeeFailure = createAction(
  '[Employee] Deactivate Employee Failure',
  props<{ error: string }>()
);

export const loadDepartments = createAction('[Employee] Load Departments');
export const loadDepartmentsSuccess = createAction(
  '[Employee] Load Departments Success',
  props<{ departments: Department[] }>()
);
export const loadDepartmentsFailure = createAction(
  '[Employee] Load Departments Failure',
  props<{ error: string }>()
);

export const loadManagers = createAction('[Employee] Load Managers');
export const loadManagersSuccess = createAction(
  '[Employee] Load Managers Success',
  props<{ managers: ManagerOption[] }>()
);
export const loadManagersFailure = createAction(
  '[Employee] Load Managers Failure',
  props<{ error: string }>()
);
