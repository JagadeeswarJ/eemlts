import { createReducer, on } from '@ngrx/store';
import { Department, Employee, ManagerOption } from '../../core/models/employee.models';
import * as EmployeeActions from './employee.actions';

export interface EmployeeState {
  employees: Employee[];
  selectedEmployee: Employee | null;
  departments: Department[];
  managers: ManagerOption[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  actionSuccess: boolean;
}

export const initialEmployeeState: EmployeeState = {
  employees: [],
  selectedEmployee: null,
  departments: [],
  managers: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
  actionSuccess: false,
};

export const employeeReducer = createReducer(
  initialEmployeeState,
  on(EmployeeActions.loadEmployees, (state) => ({ ...state, loading: true, error: null, actionSuccess: false })),
  on(EmployeeActions.loadEmployeesSuccess, (state, { response }) => ({
    ...state,
    loading: false,
    employees: response.content,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    currentPage: response.page,
    pageSize: response.size,
  })),
  on(EmployeeActions.loadEmployeesFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EmployeeActions.loadEmployeeById, (state) => ({ ...state, loading: true, error: null })),
  on(EmployeeActions.loadEmployeeByIdSuccess, (state, { employee }) => ({
    ...state,
    loading: false,
    selectedEmployee: employee,
  })),
  on(EmployeeActions.loadEmployeeByIdFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EmployeeActions.createEmployee, (state) => ({ ...state, loading: true, error: null, actionSuccess: false })),
  on(EmployeeActions.createEmployeeSuccess, (state, { employee }) => ({
    ...state,
    loading: false,
    actionSuccess: true,
    employees: [employee, ...state.employees],
  })),
  on(EmployeeActions.createEmployeeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EmployeeActions.updateEmployee, (state) => ({ ...state, loading: true, error: null, actionSuccess: false })),
  on(EmployeeActions.updateEmployeeSuccess, (state, { employee }) => ({
    ...state,
    loading: false,
    actionSuccess: true,
    selectedEmployee: employee,
    employees: state.employees.map((e) => (e.employeeId === employee.employeeId ? employee : e)),
  })),
  on(EmployeeActions.updateEmployeeFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(EmployeeActions.deactivateEmployeeSuccess, (state, { id }) => ({
    ...state,
    employees: state.employees.map((e) =>
      e.employeeId === id ? { ...e, employmentStatus: 'INACTIVE' as const } : e
    ),
  })),

  on(EmployeeActions.loadDepartmentsSuccess, (state, { departments }) => ({
    ...state,
    departments,
  })),
  on(EmployeeActions.loadManagersSuccess, (state, { managers }) => ({
    ...state,
    managers,
  }))
);
