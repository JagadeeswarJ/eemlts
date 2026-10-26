import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AttendanceState } from './attendance.reducer';

export const selectAttendanceState = createFeatureSelector<AttendanceState>('attendance');

export const selectTodayAttendance = createSelector(selectAttendanceState, (state) => state.todayRecord);
export const selectAttendanceHistory = createSelector(selectAttendanceState, (state) => state.history);
export const selectAttendanceStats = createSelector(selectAttendanceState, (state) => state.stats);
export const selectDailyAttendanceSummary = createSelector(selectAttendanceState, (state) => state.dailySummary);
export const selectAttendanceAuditLogs = createSelector(selectAttendanceState, (state) => state.auditLogs);
export const selectAttendanceLoading = createSelector(selectAttendanceState, (state) => state.loading);
export const selectAttendanceError = createSelector(selectAttendanceState, (state) => state.error);
export const selectAttendanceActionSuccess = createSelector(selectAttendanceState, (state) => state.actionSuccess);
export const selectAttendanceTotalElements = createSelector(selectAttendanceState, (state) => state.totalElements);
export const selectAttendanceTotalPages = createSelector(selectAttendanceState, (state) => state.totalPages);
export const selectAttendanceCurrentPage = createSelector(selectAttendanceState, (state) => state.currentPage);
