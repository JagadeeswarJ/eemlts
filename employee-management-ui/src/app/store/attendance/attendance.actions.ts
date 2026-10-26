import { createAction, props } from '@ngrx/store';
import {
  AttendanceAuditLog,
  AttendanceCorrectionDecision,
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceStats,
  DailyAttendanceSummary,
} from '../../core/models/attendance.models';
import { PagedResponse } from '../../core/models/auth.models';

export const checkIn = createAction('[Attendance] Check In');
export const checkInSuccess = createAction('[Attendance] Check In Success', props<{ record: AttendanceRecord }>());
export const checkInFailure = createAction('[Attendance] Check In Failure', props<{ error: string }>());

export const checkOut = createAction('[Attendance] Check Out');
export const checkOutSuccess = createAction('[Attendance] Check Out Success', props<{ record: AttendanceRecord }>());
export const checkOutFailure = createAction('[Attendance] Check Out Failure', props<{ error: string }>());

export const loadTodayAttendance = createAction('[Attendance] Load Today Attendance', props<{ employeeId?: number }>());
export const loadTodayAttendanceSuccess = createAction(
  '[Attendance] Load Today Attendance Success',
  props<{ record: AttendanceRecord }>()
);
export const loadTodayAttendanceFailure = createAction(
  '[Attendance] Load Today Attendance Failure',
  props<{ error: string }>()
);

export const loadAttendanceHistory = createAction(
  '[Attendance] Load Attendance History',
  props<{ params?: { employeeId?: number; startDate?: string; endDate?: string; status?: string; page?: number; size?: number } }>()
);
export const loadAttendanceHistorySuccess = createAction(
  '[Attendance] Load Attendance History Success',
  props<{ response: PagedResponse<AttendanceRecord> }>()
);
export const loadAttendanceHistoryFailure = createAction(
  '[Attendance] Load Attendance History Failure',
  props<{ error: string }>()
);

export const loadAttendanceStats = createAction(
  '[Attendance] Load Attendance Stats',
  props<{ employeeId?: number; year?: number; month?: number }>()
);
export const loadAttendanceStatsSuccess = createAction(
  '[Attendance] Load Attendance Stats Success',
  props<{ stats: AttendanceStats }>()
);
export const loadAttendanceStatsFailure = createAction(
  '[Attendance] Load Attendance Stats Failure',
  props<{ error: string }>()
);

export const loadDailyAttendance = createAction(
  '[Attendance] Load Daily Attendance',
  props<{ date?: string; departmentId?: number }>()
);
export const loadDailyAttendanceSuccess = createAction(
  '[Attendance] Load Daily Attendance Success',
  props<{ summary: DailyAttendanceSummary }>()
);
export const loadDailyAttendanceFailure = createAction(
  '[Attendance] Load Daily Attendance Failure',
  props<{ error: string }>()
);

export const requestCorrection = createAction(
  '[Attendance] Request Correction',
  props<{ request: AttendanceCorrectionRequest }>()
);
export const requestCorrectionSuccess = createAction(
  '[Attendance] Request Correction Success',
  props<{ log: AttendanceAuditLog }>()
);
export const requestCorrectionFailure = createAction(
  '[Attendance] Request Correction Failure',
  props<{ error: string }>()
);

export const processCorrection = createAction(
  '[Attendance] Process Correction',
  props<{ auditId: number; decision: AttendanceCorrectionDecision }>()
);
export const processCorrectionSuccess = createAction(
  '[Attendance] Process Correction Success',
  props<{ log: AttendanceAuditLog }>()
);
export const processCorrectionFailure = createAction(
  '[Attendance] Process Correction Failure',
  props<{ error: string }>()
);

export const loadAuditLogs = createAction('[Attendance] Load Audit Logs', props<{ employeeId?: number }>());
export const loadAuditLogsSuccess = createAction(
  '[Attendance] Load Audit Logs Success',
  props<{ logs: AttendanceAuditLog[] }>()
);
export const loadAuditLogsFailure = createAction(
  '[Attendance] Load Audit Logs Failure',
  props<{ error: string }>()
);
