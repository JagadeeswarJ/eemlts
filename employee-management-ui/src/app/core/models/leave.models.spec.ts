import { describe, expect, it } from 'vitest';
import {
  AdminLeaveBalance,
  AdjustLeaveBalanceRequest,
  CreateLeaveTypeRequest,
  LeaveBalance,
  LeaveBalanceAdjustment,
  LeaveRequest,
  LeaveType,
  UpdateLeaveTypeRequest,
} from './leave.models';

describe('Leave Models', () => {
  it('should instantiate valid LeaveType model with isActive', () => {
    const type: LeaveType = {
      leaveTypeId: 1,
      code: 'CASUAL',
      name: 'Casual Leave',
      description: 'Personal leave',
      annualQuota: 12,
      isCarryForward: false,
      isActive: true,
    };
    expect(type.code).toBe('CASUAL');
    expect(type.annualQuota).toBe(12);
    expect(type.isActive).toBe(true);
  });

  it('should instantiate CreateLeaveTypeRequest and UpdateLeaveTypeRequest', () => {
    const createReq: CreateLeaveTypeRequest = {
      code: 'COMPENSATORY',
      name: 'Compensatory Off',
      annualQuota: 5,
    };
    expect(createReq.code).toBe('COMPENSATORY');

    const updateReq: UpdateLeaveTypeRequest = {
      name: 'Compensatory Leave',
      annualQuota: 6,
    };
    expect(updateReq.name).toBe('Compensatory Leave');
  });

  it('should instantiate AdjustLeaveBalanceRequest and LeaveBalanceAdjustment', () => {
    const adjReq: AdjustLeaveBalanceRequest = {
      year: 2026,
      newTotal: 15,
      reason: 'Promoted with additional quota',
    };
    expect(adjReq.newTotal).toBe(15);

    const adjLog: LeaveBalanceAdjustment = {
      adjustmentId: 101,
      employeeId: 4,
      employeeName: 'Alex Jones',
      employeeCode: 'EMP004',
      leaveTypeId: 1,
      leaveTypeName: 'Casual Leave',
      year: 2026,
      previousTotal: 12,
      newTotal: 15,
      reason: 'Promoted with additional quota',
      performedBy: 'admin@company.com',
      performedAt: '2026-10-22T10:00:00',
    };
    expect(adjLog.performedBy).toBe('admin@company.com');
  });

  it('should instantiate valid AdminLeaveBalance model', () => {
    const adminBal: AdminLeaveBalance = {
      balanceId: 1,
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
      pendingDays: 0,
      availableDays: 10,
    };
    expect(adminBal.availableDays).toBe(10);
  });

  it('should instantiate valid LeaveBalance model', () => {
    const balance: LeaveBalance = {
      balanceId: 1,
      employeeId: 4,
      leaveTypeId: 1,
      leaveTypeCode: 'CASUAL',
      leaveTypeName: 'Casual Leave',
      year: 2026,
      totalDays: 12,
      usedDays: 2,
      pendingDays: 1,
      availableDays: 9,
      updatedAt: '',
    };
    expect(balance.availableDays).toBe(9);
  });

  it('should instantiate valid LeaveRequest model', () => {
    const request: LeaveRequest = {
      leaveRequestId: 101,
      employeeId: 4,
      employeeCode: 'EMP004',
      employeeName: 'Alex Jones',
      leaveTypeId: 1,
      leaveTypeCode: 'CASUAL',
      leaveTypeName: 'Casual Leave',
      startDate: '2026-11-10',
      endDate: '2026-11-11',
      totalDays: 2,
      reason: 'Personal errand',
      status: 'PENDING',
      approverId: null,
      approverName: 'Pending',
      approverComments: null,
      decisionDate: null,
      createdAt: '',
      updatedAt: '',
    };
    expect(request.status).toBe('PENDING');
    expect(request.totalDays).toBe(2);
  });
});
