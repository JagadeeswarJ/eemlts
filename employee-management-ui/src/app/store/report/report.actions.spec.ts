import { describe, expect, it } from 'vitest';
import * as ReportActions from './report.actions';

describe('Report Actions', () => {
  it('should create loadEmployeeDashboard action', () => {
    const action = ReportActions.loadEmployeeDashboard();
    expect(action.type).toBe('[Report] Load Employee Dashboard');
  });

  it('should create loadManagerDashboard action', () => {
    const action = ReportActions.loadManagerDashboard();
    expect(action.type).toBe('[Report] Load Manager Dashboard');
  });

  it('should create loadHrDashboard action', () => {
    const action = ReportActions.loadHrDashboard();
    expect(action.type).toBe('[Report] Load HR Dashboard');
  });
});
