import { describe, expect, it } from 'vitest';
import { ReportState } from './report.reducer';
import * as ReportSelectors from './report.selectors';

describe('Report Selectors', () => {
  const state: ReportState = {
    employeeDashboard: null,
    employeeLoading: false,
    employeeError: null,
    managerDashboard: null,
    managerLoading: false,
    managerError: 'Forbidden',
    hrDashboard: null,
    hrLoading: false,
    hrError: null,
    departmentReports: [],
    attendanceReports: [],
    leaveReports: [],
    loading: false,
    error: null,
  };

  it('should select employeeDashboard', () => {
    expect(ReportSelectors.selectEmployeeDashboard.projector(state)).toBeNull();
  });

  it('should select managerDashboardError independently', () => {
    expect(ReportSelectors.selectManagerDashboardError.projector(state)).toBe('Forbidden');
    expect(ReportSelectors.selectEmployeeDashboardError.projector(state)).toBeNull();
  });

  it('should select hrDashboard', () => {
    expect(ReportSelectors.selectHrDashboard.projector(state)).toBeNull();
  });
});
