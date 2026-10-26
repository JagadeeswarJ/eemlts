import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LeaveState } from './leave.reducer';

export const selectLeaveState = createFeatureSelector<LeaveState>('leave');

export const selectLeaveTypes = createSelector(selectLeaveState, (state) => state.types);
export const selectLeaveBalances = createSelector(selectLeaveState, (state) => state.balances);
export const selectLeaveHistory = createSelector(selectLeaveState, (state) => state.history);
export const selectPendingApprovals = createSelector(selectLeaveState, (state) => state.pendingApprovals);
export const selectCalendarItems = createSelector(selectLeaveState, (state) => state.calendarItems);
export const selectLeaveLoading = createSelector(selectLeaveState, (state) => state.loading);
export const selectLeaveError = createSelector(selectLeaveState, (state) => state.error);
export const selectLeaveActionSuccess = createSelector(selectLeaveState, (state) => state.actionSuccess);
export const selectLeaveTotalElements = createSelector(selectLeaveState, (state) => state.totalElements);
export const selectLeaveTotalPages = createSelector(selectLeaveState, (state) => state.totalPages);
export const selectLeaveCurrentPage = createSelector(selectLeaveState, (state) => state.currentPage);
