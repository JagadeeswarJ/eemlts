import { ActionReducerMap } from '@ngrx/store';
import { attendanceReducer, AttendanceState } from './attendance/attendance.reducer';
import { authReducer, AuthState } from './auth/auth.reducer';
import { departmentReducer, DepartmentState } from './departments/department.reducer';
import { employeeReducer, EmployeeState } from './employee/employee.reducer';
import { leaveReducer, LeaveState } from './leave/leave.reducer';
import { reportReducer, ReportState } from './report/report.reducer';

export interface AppState {
  auth: AuthState;
  departments: DepartmentState;
  employee: EmployeeState;
  attendance: AttendanceState;
  leave: LeaveState;
  report: ReportState;
}

export const appReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  departments: departmentReducer,
  employee: employeeReducer,
  attendance: attendanceReducer,
  leave: leaveReducer,
  report: reportReducer,
};
