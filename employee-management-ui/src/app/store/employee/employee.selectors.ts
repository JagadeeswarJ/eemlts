import { createFeatureSelector, createSelector } from '@ngrx/store';
import { EmployeeState } from './employee.reducer';

export const selectEmployeeState = createFeatureSelector<EmployeeState>('employee');

export const selectAllEmployees = createSelector(selectEmployeeState, (state) => state.employees);
export const selectSelectedEmployee = createSelector(selectEmployeeState, (state) => state.selectedEmployee);
export const selectDepartments = createSelector(selectEmployeeState, (state) => state.departments);
export const selectManagers = createSelector(selectEmployeeState, (state) => state.managers);
export const selectEmployeeLoading = createSelector(selectEmployeeState, (state) => state.loading);
export const selectEmployeeError = createSelector(selectEmployeeState, (state) => state.error);
export const selectEmployeeTotalElements = createSelector(selectEmployeeState, (state) => state.totalElements);
export const selectEmployeeTotalPages = createSelector(selectEmployeeState, (state) => state.totalPages);
export const selectEmployeeCurrentPage = createSelector(selectEmployeeState, (state) => state.currentPage);
export const selectEmployeePageSize = createSelector(selectEmployeeState, (state) => state.pageSize);
export const selectEmployeeActionSuccess = createSelector(selectEmployeeState, (state) => state.actionSuccess);
