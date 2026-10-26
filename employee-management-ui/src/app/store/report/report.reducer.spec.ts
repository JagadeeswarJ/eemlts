import { describe, expect, it } from 'vitest';
import * as ReportActions from './report.actions';
import { initialReportState, reportReducer } from './report.reducer';

describe('Report Reducer', () => {
  it('should set employeeLoading true on loadEmployeeDashboard', () => {
    const state = reportReducer(initialReportState, ReportActions.loadEmployeeDashboard());
    expect(state.employeeLoading).toBe(true);
    expect(state.employeeError).toBeNull();
  });

  it('should store employeeDashboard and set employeeLoading false on loadEmployeeDashboardSuccess', () => {
    const mockDashboard = {
      profile: {} as any,
      attendanceSummary: {} as any,
      leaveBalances: [],
      recentRequests: [],
      recentAttendance: [],
      upcomingHolidays: [],
    };

    const action = ReportActions.loadEmployeeDashboardSuccess({ dashboard: mockDashboard });
    const state = reportReducer(initialReportState, action);

    expect(state.employeeLoading).toBe(false);
    expect(state.employeeDashboard).toEqual(mockDashboard);
  });

  it('should isolate error when loadManagerDashboard fails without clearing employee data', () => {
    const stateWithEmp = {
      ...initialReportState,
      employeeDashboard: { profile: {} as any } as any,
    };

    const action = ReportActions.loadManagerDashboardFailure({ error: 'Forbidden' });
    const state = reportReducer(stateWithEmp, action);

    expect(state.managerLoading).toBe(false);
    expect(state.managerError).toBe('Forbidden');
    // Employee dashboard data remains preserved
    expect(state.employeeDashboard).not.toBeNull();
  });

  it('should set hrLoading true on loadHrDashboard', () => {
    const state = reportReducer(initialReportState, ReportActions.loadHrDashboard());
    expect(state.hrLoading).toBe(true);
  });

  it('should store hrDashboard on loadHrDashboardSuccess', () => {
    const mockDashboard = {
      totalEmployees: 6,
      activeEmployees: 6,
      inactiveEmployees: 0,
      companyWideAttendanceRate: 95.0,
      averageDailyWorkingHours: 8.4,
      totalApprovedLeaves: 5,
      totalPendingLeaves: 2,
      totalRejectedLeaves: 1,
      departmentDistribution: [],
      leaveTypeMetrics: [],
    };

    const action = ReportActions.loadHrDashboardSuccess({ dashboard: mockDashboard as any });
    const state = reportReducer(initialReportState, action);

    expect(state.hrLoading).toBe(false);
    expect(state.hrDashboard?.totalEmployees).toBe(6);
  });
});
