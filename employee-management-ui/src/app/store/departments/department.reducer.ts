import { createReducer, on } from '@ngrx/store';
import { Department } from '../../core/models/employee.models';
import * as DepartmentActions from './department.actions';

export interface DepartmentState {
  departments: Department[];
  loading: boolean;
  error: string | null;
}

export const initialDepartmentState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
};

export const departmentReducer = createReducer(
  initialDepartmentState,
  on(DepartmentActions.loadDepartments, (state) => ({ ...state, loading: true, error: null })),
  on(DepartmentActions.loadDepartmentsSuccess, (state, { departments }) => ({
    ...state,
    loading: false,
    departments,
    error: null,
  })),
  on(DepartmentActions.loadDepartmentsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
