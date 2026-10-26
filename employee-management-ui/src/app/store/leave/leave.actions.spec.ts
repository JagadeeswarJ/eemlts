import { describe, expect, it } from 'vitest';
import * as LeaveActions from './leave.actions';

describe('Leave Actions', () => {
  it('should create applyLeave action', () => {
    const action = LeaveActions.applyLeave({
      request: { leaveTypeId: 1, startDate: '2026-11-01', endDate: '2026-11-02', reason: 'Personal' },
    });
    expect(action.type).toBe('[Leave] Apply Leave');
  });

  it('should create approveLeave action', () => {
    const action = LeaveActions.approveLeave({ leaveRequestId: 101 });
    expect(action.type).toBe('[Leave] Approve Leave');
  });

  it('should create cancelLeave action', () => {
    const action = LeaveActions.cancelLeave({ leaveRequestId: 101 });
    expect(action.type).toBe('[Leave] Cancel Leave');
  });
});
