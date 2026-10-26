import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLeaveBalance, LeaveBalanceAdjustment } from '../../../core/models/leave.models';
import { DepartmentService } from '../../../core/services/department.service';
import { LeaveService } from '../../../core/services/leave.service';
import { NotificationService } from '../../../core/services/notification.service';
import { LeaveAllocationsComponent } from './leave-allocations.component';

describe('LeaveAllocationsComponent', () => {
  let component: LeaveAllocationsComponent;
  let fixture: ComponentFixture<LeaveAllocationsComponent>;
  let leaveServiceMock: {
    getAdminBalances: any;
    adjustLeaveAllocation: any;
    getBalanceAdjustments: any;
  };
  let departmentServiceMock: { getDepartments: any };
  let notificationServiceMock: {
    success: any;
    error: any;
    confirm: any;
  };

  const mockBalance: AdminLeaveBalance = {
    balanceId: 10,
    employeeId: 4,
    employeeName: 'Alex Jones',
    employeeCode: 'EMP004',
    departmentId: 1,
    departmentName: 'Engineering',
    leaveTypeId: 1,
    leaveTypeCode: 'CASUAL',
    leaveTypeName: 'Casual Leave',
    year: 2026,
    totalDays: 12,
    usedDays: 2,
    pendingDays: 1,
    availableDays: 9,
  };

  const mockAudit: LeaveBalanceAdjustment = {
    adjustmentId: 101,
    employeeId: 4,
    employeeName: 'Alex Jones',
    employeeCode: 'EMP004',
    leaveTypeId: 1,
    leaveTypeName: 'Casual Leave',
    year: 2026,
    previousTotal: 12,
    newTotal: 15,
    reason: 'Annual promotion adjustment',
    performedBy: 'hr@company.com',
    performedAt: '2026-10-22T12:00:00',
  };

  beforeEach(async () => {
    leaveServiceMock = {
      getAdminBalances: vi.fn().mockReturnValue(
        of({
          success: true,
          data: {
            content: [mockBalance],
            totalElements: 1,
            totalPages: 1,
            page: 0,
            size: 10,
            isFirst: true,
            isLast: true,
          },
        })
      ),
      adjustLeaveAllocation: vi.fn().mockReturnValue(of({ success: true, data: mockBalance })),
      getBalanceAdjustments: vi.fn().mockReturnValue(of({ success: true, data: [mockAudit] })),
    };

    departmentServiceMock = {
      getDepartments: vi.fn().mockReturnValue(
        of({
          success: true,
          data: [{ departmentId: 1, name: 'Engineering', code: 'ENG' }],
        })
      ),
    };

    notificationServiceMock = {
      success: vi.fn(),
      error: vi.fn(),
      confirm: vi.fn().mockResolvedValue(true),
    };

    await TestBed.configureTestingModule({
      imports: [LeaveAllocationsComponent, ReactiveFormsModule, FormsModule],
      providers: [
        provideRouter([]),
        { provide: LeaveService, useValue: leaveServiceMock },
        { provide: DepartmentService, useValue: departmentServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LeaveAllocationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize and load employee balances and departments', () => {
    expect(component).toBeTruthy();
    expect(leaveServiceMock.getAdminBalances).toHaveBeenCalled();
    expect(departmentServiceMock.getDepartments).toHaveBeenCalled();
    expect(component.balances.length).toBe(1);
    expect(component.balances[0].employeeName).toBe('Alex Jones');
  });

  it('should filter allocations by department and search', () => {
    component.searchQuery = 'Alex';
    component.selectedDepartmentId = 1;
    component.onFilterChange();

    expect(component.currentPage).toBe(0);
    expect(leaveServiceMock.getAdminBalances).toHaveBeenCalled();
  });

  it('should prevent quota lower than used + pending days', async () => {
    component.openAdjustModal(mockBalance); // used = 2, pending = 1 (min 3)
    component.adjustForm.patchValue({
      newTotal: 2, // invalid: less than 3
      reason: 'Valid reason note',
    });

    await component.onSaveAdjustment();

    expect(component.adjustForm.get('newTotal')?.hasError('minRequired')).toBe(true);
    expect(leaveServiceMock.adjustLeaveAllocation).not.toHaveBeenCalled();
  });

  it('should adjust allocation with valid total and mandatory reason', async () => {
    component.openAdjustModal(mockBalance);
    component.adjustForm.patchValue({
      newTotal: 15,
      reason: 'Annual contract renewal adjustment',
    });

    await component.onSaveAdjustment();

    expect(notificationServiceMock.confirm).toHaveBeenCalled();
    expect(leaveServiceMock.adjustLeaveAllocation).toHaveBeenCalledWith(4, 1, {
      year: 2026,
      newTotal: 15,
      reason: 'Annual contract renewal adjustment',
    });
    expect(notificationServiceMock.success).toHaveBeenCalled();
  });

  it('should load audit history when tab switched', () => {
    component.loadAuditLogs();
    component.activeView = 'history';

    expect(leaveServiceMock.getBalanceAdjustments).toHaveBeenCalled();
    expect(component.auditLogs.length).toBe(1);
    expect(component.auditLogs[0].performedBy).toBe('hr@company.com');
  });
});
