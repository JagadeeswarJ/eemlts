import { describe, expect, it } from 'vitest';
import { DepartmentReport, HrDashboard, ManagerDashboard } from './report.models';

describe('Report Models', () => {
  it('should instantiate valid DepartmentReport model', () => {
    const report: DepartmentReport = {
      departmentId: 1,
      name: 'Engineering',
      code: 'ENG',
      managerName: 'David Miller',
      totalEmployees: 4,
      presentToday: 4,
      onLeaveToday: 0,
      absentToday: 0,
      attendanceRate: 100.0,
    };
    expect(report.attendanceRate).toBe(100.0);
    expect(report.totalEmployees).toBe(4);
  });

  it('should instantiate valid ManagerDashboard model', () => {
    const mgr: ManagerDashboard = {
      departmentName: 'Engineering',
      totalTeamMembers: 4,
      presentToday: 3,
      onLeaveToday: 1,
      absentToday: 0,
      teamAttendancePercentage: 87.5,
      pendingApprovalsCount: 1,
      pendingApprovals: [],
      leaveTrends: [],
    };
    expect(mgr.teamAttendancePercentage).toBe(87.5);
    expect(mgr.totalTeamMembers).toBe(4);
  });

  it('should instantiate valid HrDashboard model', () => {
    const hr: HrDashboard = {
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
    expect(hr.totalEmployees).toBe(6);
    expect(hr.companyWideAttendanceRate).toBe(95.0);
  });
});
