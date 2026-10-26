import { describe, expect, it } from 'vitest';
import { LeaveRequest } from '../../core/models/leave.models';
import * as LeaveActions from './leave.actions';
import { initialLeaveState, leaveReducer } from './leave.reducer';

describe('Leave Reducer', () => {
  const mockRequest: LeaveRequest = {
    leaveRequestId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    leaveTypeId: 1,
    leaveTypeCode: 'CASUAL',
    leaveTypeName: 'Casual Leave',
    startDate: '2026-11-01',
    endDate: '2026-11-02',
    totalDays: 2,
    reason: 'Personal',
    status: 'PENDING',
    approverId: null,
    approverName: '',
    approverComments: null,
    decisionDate: null,
    createdAt: '',
    updatedAt: '',
  };

  it('should add applied request on applyLeaveSuccess', () => {
    const action = LeaveActions.applyLeaveSuccess({ request: mockRequest });
    const state = leaveReducer(initialLeaveState, action);

    expect(state.history.length).toBe(1);
    expect(state.actionSuccess).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should update status on approveLeaveSuccess', () => {
    const startingState = {
      ...initialLeaveState,
      history: [mockRequest],
      pendingApprovals: [mockRequest],
    };

    const approvedRequest = { ...mockRequest, status: 'APPROVED' as const };
    const action = LeaveActions.approveLeaveSuccess({ request: approvedRequest });
    const state = leaveReducer(startingState, action);

    expect(state.pendingApprovals.length).toBe(0);
    expect(state.history[0].status).toBe('APPROVED');
  });
});
