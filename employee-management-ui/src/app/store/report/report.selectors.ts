import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ReportState } from './report.reducer';

export const selectReportState = createFeatureSelector<ReportState>('report');

// Employee Dashboard
export const selectEmployeeDashboard = createSelector(
  selectReportState,
  (state) => state?.employeeDashboard ?? null
);

export const selectEmployeeDashboardLoading = createSelector(
  selectReportState,
  (state) => state?.employeeLoading ?? false
);

export const selectEmployeeDashboardError = createSelector(
  selectReportState,
  (state) => state?.employeeError ?? null
);

// Manager Dashboard
export const selectManagerDashboard = createSelector(
  selectReportState,
  (state) => state?.managerDashboard ?? null
);

export const selectManagerDashboardLoading = createSelector(
  selectReportState,
  (state) => state?.managerLoading ?? false
);

export const selectManagerDashboardError = createSelector(
  selectReportState,
  (state) => state?.managerError ?? null
);

// HR Dashboard
export const selectHrDashboard = createSelector(
  selectReportState,
  (state) => state?.hrDashboard ?? null
);

export const selectHrDashboardLoading = createSelector(
  selectReportState,
  (state) => state?.hrLoading ?? false
);

export const selectHrDashboardError = createSelector(
  selectReportState,
  (state) => state?.hrError ?? null
);

// Specific Reports
export const selectDepartmentReports = createSelector(
  selectReportState,
  (state) => state?.departmentReports ?? []
);

export const selectAttendanceReports = createSelector(
  selectReportState,
  (state) => state?.attendanceReports ?? []
);

export const selectLeaveReports = createSelector(
  selectReportState,
  (state) => state?.leaveReports ?? []
);

// Global State
export const selectReportLoading = createSelector(
  selectReportState,
  (state) => state?.loading ?? false
);

export const selectReportError = createSelector(
  selectReportState,
  (state) => state?.error ?? null
);
