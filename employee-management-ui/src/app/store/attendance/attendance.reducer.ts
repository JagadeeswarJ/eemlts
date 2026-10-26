import { createReducer, on } from '@ngrx/store';
import {
  AttendanceAuditLog,
  AttendanceRecord,
  AttendanceStats,
  DailyAttendanceSummary,
} from '../../core/models/attendance.models';
import * as AttendanceActions from './attendance.actions';

export interface AttendanceState {
  todayRecord: AttendanceRecord | null;
  history: AttendanceRecord[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  stats: AttendanceStats | null;
  dailySummary: DailyAttendanceSummary | null;
  auditLogs: AttendanceAuditLog[];
  loading: boolean;
  error: string | null;
  actionSuccess: boolean;
}

export const initialAttendanceState: AttendanceState = {
  todayRecord: null,
  history: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  stats: null,
  dailySummary: null,
  auditLogs: [],
  loading: false,
  error: null,
  actionSuccess: false,
};

export const attendanceReducer = createReducer(
  initialAttendanceState,
  on(AttendanceActions.checkIn, (state) => ({ ...state, loading: true, error: null })),
  on(AttendanceActions.checkInSuccess, (state, { record }) => ({
    ...state,
    loading: false,
    todayRecord: record,
    actionSuccess: true,
  })),
  on(AttendanceActions.checkInFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AttendanceActions.checkOut, (state) => ({ ...state, loading: true, error: null })),
  on(AttendanceActions.checkOutSuccess, (state, { record }) => ({
    ...state,
    loading: false,
    todayRecord: record,
    actionSuccess: true,
  })),
  on(AttendanceActions.checkOutFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AttendanceActions.loadTodayAttendanceSuccess, (state, { record }) => ({
    ...state,
    todayRecord: record,
  })),

  on(AttendanceActions.loadAttendanceHistory, (state) => ({ ...state, loading: true, error: null })),
  on(AttendanceActions.loadAttendanceHistorySuccess, (state, { response }) => ({
    ...state,
    loading: false,
    history: response.content,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    currentPage: response.page,
    pageSize: response.size,
  })),
  on(AttendanceActions.loadAttendanceHistoryFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(AttendanceActions.loadAttendanceStatsSuccess, (state, { stats }) => ({
    ...state,
    stats,
  })),

  on(AttendanceActions.loadDailyAttendanceSuccess, (state, { summary }) => ({
    ...state,
    dailySummary: summary,
  })),

  on(AttendanceActions.requestCorrectionSuccess, (state) => ({
    ...state,
    actionSuccess: true,
  })),

  on(AttendanceActions.loadAuditLogsSuccess, (state, { logs }) => ({
    ...state,
    auditLogs: logs,
  }))
);
