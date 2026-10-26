import { createAction, props } from '@ngrx/store';
import { Department } from '../../core/models/employee.models';

export const loadDepartments = createAction('[Department] Load Departments');
export const loadDepartmentsSuccess = createAction(
  '[Department] Load Departments Success',
  props<{ departments: Department[] }>()
);
export const loadDepartmentsFailure = createAction(
  '[Department] Load Departments Failure',
  props<{ error: string }>()
);
