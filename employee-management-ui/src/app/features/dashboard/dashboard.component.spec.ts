import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { checkIn, checkOut } from '../../store/attendance/attendance.actions';
import { selectTodayAttendance } from '../../store/attendance/attendance.selectors';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { approveLeave, rejectLeave } from '../../store/leave/leave.actions';
import {
  selectEmployeeDashboard,
  selectEmployeeDashboardError,
  selectEmployeeDashboardLoading,
  selectHrDashboard,
  selectHrDashboardError,
  selectHrDashboardLoading,
  selectManagerDashboard,
  selectManagerDashboardError,
  selectManagerDashboardLoading,
  selectReportLoading,
} from '../../store/report/report.selectors';
import { DashboardComponent } from './dashboard.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let store: MockStore;

  const mockUser = {
    userId: 1,
    employeeId: 4,
    employeeCode: 'EMP004',
    email: 'alex.jones@company.com',
    role: 'EMPLOYEE' as const,
    firstName: 'Alex',
    lastName: 'Jones',
    fullName: 'Alex Jones',
    departmentId: 1,
    departmentName: 'Engineering',
    designation: 'Senior Engineer',
  };

  const mockToday = {
    attendanceId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    attendanceDate: '2026-10-22',
    checkInTime: '2026-10-22T09:00:00',
    checkOutTime: null,
    totalHours: 0,
    status: 'PRESENT' as const,
    canCheckIn: false,
    canCheckOut: true,
    createdAt: '',
    updatedAt: '',
  };

  const mockEmpDashboard = {
    profile: mockUser as any,
    attendanceSummary: {} as any,
    recentAttendance: [],
    leaveBalances: [
      {
        balanceId: 1,
        employeeId: 4,
        leaveTypeId: 1,
        leaveTypeCode: 'CASUAL' as const,
        leaveTypeName: 'Casual Leave',
        year: 2026,
        totalDays: 12,
        usedDays: 2,
        pendingDays: 1,
        availableDays: 9,
        updatedAt: '',
      },
    ],
    recentRequests: [],
    upcomingHolidays: [
      {
        name: 'Thanksgiving Day',
        date: '2026-11-26',
        dayOfWeek: 'Thursday',
      },
    ],
  };

  const mockMgrDashboard = {
    departmentName: 'Engineering',
    totalTeamMembers: 4,
    presentToday: 3,
    onLeaveToday: 1,
    absentToday: 0,
    teamAttendancePercentage: 87.5,
    pendingApprovalsCount: 1,
    pendingApprovals: [
      {
        leaveRequestId: 201,
        employeeId: 5,
        employeeName: 'Sarah Smith',
        leaveTypeName: 'Casual Leave',
        startDate: '2026-11-01',
        endDate: '2026-11-02',
        totalDays: 2,
        reason: 'Personal',
      },
    ],
    leaveTrends: [],
  };

  const mockHrDashboard = {
    totalEmployees: 6,
    activeEmployees: 6,
    inactiveEmployees: 0,
    companyWideAttendanceRate: 95.0,
    averageDailyWorkingHours: 8.4,
    totalApprovedLeaves: 5,
    totalPendingLeaves: 2,
    totalRejectedLeaves: 1,
    departmentDistribution: [
      { departmentId: 1, departmentName: 'Engineering', employeeCount: 4, percentage: 66.7 },
    ],
    leaveTypeMetrics: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCurrentUser, mockUser);
    store.overrideSelector(selectTodayAttendance, mockToday);
    store.overrideSelector(selectEmployeeDashboard, mockEmpDashboard);
    store.overrideSelector(selectEmployeeDashboardLoading, false);
    store.overrideSelector(selectEmployeeDashboardError, null);
    store.overrideSelector(selectManagerDashboard, mockMgrDashboard);
    store.overrideSelector(selectManagerDashboardLoading, false);
    store.overrideSelector(selectManagerDashboardError, null);
    store.overrideSelector(selectHrDashboard, mockHrDashboard);
    store.overrideSelector(selectHrDashboardLoading, false);
    store.overrideSelector(selectHrDashboardError, null);
    store.overrideSelector(selectReportLoading, false);

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render dashboard overview and welcome message', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Executive Dashboard');
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('Casual Leave');
  });

  it('should dispatch checkIn and checkOut when called', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.onCheckIn();
    expect(dispatchSpy).toHaveBeenCalledWith(checkIn());

    component.onCheckOut();
    expect(dispatchSpy).toHaveBeenCalledWith(checkOut());
  });

  it('should switch tabs and dispatch approve/reject leave actions', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.activeTab = 'manager';
    fixture.detectChanges();
    expect(component.activeTab).toBe('manager');

    component.onApproveLeave(201);
    expect(dispatchSpy).toHaveBeenCalledWith(
      approveLeave({ leaveRequestId: 201, decision: { comment: 'Approved via Manager Dashboard' } })
    );

    component.onRejectLeave(201);
    expect(dispatchSpy).toHaveBeenCalledWith(
      rejectLeave({ leaveRequestId: 201, decision: { comment: 'Rejected via Manager Dashboard' } })
    );

    component.activeTab = 'hr';
    fixture.detectChanges();
    expect(component.activeTab).toBe('hr');
  });

  it('should display friendly 504 error and allow isolated retry without redirecting', () => {
    store.overrideSelector(
      selectEmployeeDashboardError,
      'Some dashboard information is temporarily unavailable. Please try again.'
    );
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Some dashboard information is temporarily unavailable. Please try again.');

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.retryEmployeeDashboard();

    expect(dispatchSpy).toHaveBeenCalledWith(expect.objectContaining({ type: '[Report] Load Employee Dashboard' }));
  });

  it('should return correct border colors in getBalanceBorder', () => {
    expect(component.getBalanceBorder('CASUAL')).toBe('border-blue-500');
    expect(component.getBalanceBorder('SICK')).toBe('border-rose-500');
    expect(component.getBalanceBorder('EARNED')).toBe('border-emerald-500');
    expect(component.getBalanceBorder('UNKNOWN')).toBe('border-slate-400');
  });
});
