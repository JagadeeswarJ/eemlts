import { createAction, props } from '@ngrx/store';
import {
  AttendanceReport,
  DepartmentReport,
  EmployeeDashboard,
  HrDashboard,
  LeaveReport,
  ManagerDashboard,
} from '../../core/models/report.models';

export const loadEmployeeDashboard = createAction('[Report] Load Employee Dashboard');
export const loadEmployeeDashboardSuccess = createAction(
  '[Report] Load Employee Dashboard Success',
  props<{ dashboard: EmployeeDashboard }>()
);
export const loadEmployeeDashboardFailure = createAction(
  '[Report] Load Employee Dashboard Failure',
  props<{ error: string }>()
);

export const loadManagerDashboard = createAction('[Report] Load Manager Dashboard');
export const loadManagerDashboardSuccess = createAction(
  '[Report] Load Manager Dashboard Success',
  props<{ dashboard: ManagerDashboard }>()
);
export const loadManagerDashboardFailure = createAction(
  '[Report] Load Manager Dashboard Failure',
  props<{ error: string }>()
);

export const loadHrDashboard = createAction('[Report] Load HR Dashboard');
export const loadHrDashboardSuccess = createAction(
  '[Report] Load HR Dashboard Success',
  props<{ dashboard: HrDashboard }>()
);
export const loadHrDashboardFailure = createAction(
  '[Report] Load HR Dashboard Failure',
  props<{ error: string }>()
);

export const loadDepartmentReports = createAction('[Report] Load Department Reports');
export const loadDepartmentReportsSuccess = createAction(
  '[Report] Load Department Reports Success',
  props<{ reports: DepartmentReport[] }>()
);
export const loadDepartmentReportsFailure = createAction(
  '[Report] Load Department Reports Failure',
  props<{ error: string }>()
);

export const loadAttendanceReports = createAction('[Report] Load Attendance Reports', props<{ year?: number }>());
export const loadAttendanceReportsSuccess = createAction(
  '[Report] Load Attendance Reports Success',
  props<{ reports: AttendanceReport[] }>()
);
export const loadAttendanceReportsFailure = createAction(
  '[Report] Load Attendance Reports Failure',
  props<{ error: string }>()
);

export const loadLeaveReports = createAction('[Report] Load Leave Reports', props<{ year?: number }>());
export const loadLeaveReportsSuccess = createAction(
  '[Report] Load Leave Reports Success',
  props<{ reports: LeaveReport[] }>()
);
export const loadLeaveReportsFailure = createAction(
  '[Report] Load Leave Reports Failure',
  props<{ error: string }>()
);
