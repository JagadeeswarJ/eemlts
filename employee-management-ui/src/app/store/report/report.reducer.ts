import { createReducer, on } from '@ngrx/store';
import {
  AttendanceReport,
  DepartmentReport,
  EmployeeDashboard,
  HrDashboard,
  LeaveReport,
  ManagerDashboard,
} from '../../core/models/report.models';
import * as ReportActions from './report.actions';

export interface ReportState {
  employeeDashboard: EmployeeDashboard | null;
  employeeLoading: boolean;
  employeeError: string | null;

  managerDashboard: ManagerDashboard | null;
  managerLoading: boolean;
  managerError: string | null;

  hrDashboard: HrDashboard | null;
  hrLoading: boolean;
  hrError: string | null;

  departmentReports: DepartmentReport[];
  attendanceReports: AttendanceReport[];
  leaveReports: LeaveReport[];

  loading: boolean;
  error: string | null;
}

export const initialReportState: ReportState = {
  employeeDashboard: null,
  employeeLoading: false,
  employeeError: null,

  managerDashboard: null,
  managerLoading: false,
  managerError: null,

  hrDashboard: null,
  hrLoading: false,
  hrError: null,

  departmentReports: [],
  attendanceReports: [],
  leaveReports: [],

  loading: false,
  error: null,
};

export const reportReducer = createReducer(
  initialReportState,

  // Employee Dashboard
  on(ReportActions.loadEmployeeDashboard, (state) => ({
    ...state,
    employeeLoading: true,
    employeeError: null,
  })),
  on(ReportActions.loadEmployeeDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    employeeLoading: false,
    employeeDashboard: dashboard,
    employeeError: null,
  })),
  on(ReportActions.loadEmployeeDashboardFailure, (state, { error }) => ({
    ...state,
    employeeLoading: false,
    employeeError: error,
  })),

  // Manager Dashboard
  on(ReportActions.loadManagerDashboard, (state) => ({
    ...state,
    managerLoading: true,
    managerError: null,
  })),
  on(ReportActions.loadManagerDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    managerLoading: false,
    managerDashboard: dashboard,
    managerError: null,
  })),
  on(ReportActions.loadManagerDashboardFailure, (state, { error }) => ({
    ...state,
    managerLoading: false,
    managerError: error,
  })),

  // HR Dashboard
  on(ReportActions.loadHrDashboard, (state) => ({
    ...state,
    hrLoading: true,
    hrError: null,
  })),
  on(ReportActions.loadHrDashboardSuccess, (state, { dashboard }) => ({
    ...state,
    hrLoading: false,
    hrDashboard: dashboard,
    hrError: null,
  })),
  on(ReportActions.loadHrDashboardFailure, (state, { error }) => ({
    ...state,
    hrLoading: false,
    hrError: error,
  })),

  // Other Reports
  on(ReportActions.loadDepartmentReports, (state) => ({ ...state, loading: true, error: null })),
  on(ReportActions.loadDepartmentReportsSuccess, (state, { reports }) => ({
    ...state,
    loading: false,
    departmentReports: reports,
  })),
  on(ReportActions.loadDepartmentReportsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ReportActions.loadAttendanceReports, (state) => ({ ...state, loading: true, error: null })),
  on(ReportActions.loadAttendanceReportsSuccess, (state, { reports }) => ({
    ...state,
    loading: false,
    attendanceReports: reports,
  })),
  on(ReportActions.loadAttendanceReportsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ReportActions.loadLeaveReports, (state) => ({ ...state, loading: true, error: null })),
  on(ReportActions.loadLeaveReportsSuccess, (state, { reports }) => ({
    ...state,
    loading: false,
    leaveReports: reports,
  })),
  on(ReportActions.loadLeaveReportsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
