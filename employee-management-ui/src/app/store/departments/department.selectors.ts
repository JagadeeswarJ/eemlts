import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DepartmentState } from './department.reducer';

export const selectDepartmentState = createFeatureSelector<DepartmentState>('departments');

export const selectAllDepartments = createSelector(
  selectDepartmentState,
  (state) => state.departments
);

export const selectDepartmentsLoading = createSelector(
  selectDepartmentState,
  (state) => state.loading
);

export const selectDepartmentsError = createSelector(
  selectDepartmentState,
  (state) => state.error
);
