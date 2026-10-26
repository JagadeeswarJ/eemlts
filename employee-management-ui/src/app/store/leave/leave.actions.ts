import { createAction, props } from '@ngrx/store';
import { PagedResponse } from '../../core/models/auth.models';
import {
  ApplyLeaveRequest,
  LeaveBalance,
  LeaveDecisionRequest,
  LeaveRequest,
  LeaveType,
  TeamLeaveCalendarItem,
} from '../../core/models/leave.models';

export const loadLeaveTypes = createAction('[Leave] Load Leave Types');
export const loadLeaveTypesSuccess = createAction(
  '[Leave] Load Leave Types Success',
  props<{ types: LeaveType[] }>()
);
export const loadLeaveTypesFailure = createAction(
  '[Leave] Load Leave Types Failure',
  props<{ error: string }>()
);

export const loadLeaveBalances = createAction(
  '[Leave] Load Leave Balances',
  props<{ employeeId?: number; year?: number }>()
);
export const loadLeaveBalancesSuccess = createAction(
  '[Leave] Load Leave Balances Success',
  props<{ balances: LeaveBalance[] }>()
);
export const loadLeaveBalancesFailure = createAction(
  '[Leave] Load Leave Balances Failure',
  props<{ error: string }>()
);

export const applyLeave = createAction(
  '[Leave] Apply Leave',
  props<{ request: ApplyLeaveRequest }>()
);
export const applyLeaveSuccess = createAction(
  '[Leave] Apply Leave Success',
  props<{ request: LeaveRequest }>()
);
export const applyLeaveFailure = createAction(
  '[Leave] Apply Leave Failure',
  props<{ error: string }>()
);

export const cancelLeave = createAction(
  '[Leave] Cancel Leave',
  props<{ leaveRequestId: number }>()
);
export const cancelLeaveSuccess = createAction(
  '[Leave] Cancel Leave Success',
  props<{ request: LeaveRequest }>()
);
export const cancelLeaveFailure = createAction(
  '[Leave] Cancel Leave Failure',
  props<{ error: string }>()
);

export const approveLeave = createAction(
  '[Leave] Approve Leave',
  props<{ leaveRequestId: number; decision?: LeaveDecisionRequest }>()
);
export const approveLeaveSuccess = createAction(
  '[Leave] Approve Leave Success',
  props<{ request: LeaveRequest }>()
);
export const approveLeaveFailure = createAction(
  '[Leave] Approve Leave Failure',
  props<{ error: string }>()
);

export const rejectLeave = createAction(
  '[Leave] Reject Leave',
  props<{ leaveRequestId: number; decision?: LeaveDecisionRequest }>()
);
export const rejectLeaveSuccess = createAction(
  '[Leave] Reject Leave Success',
  props<{ request: LeaveRequest }>()
);
export const rejectLeaveFailure = createAction(
  '[Leave] Reject Leave Failure',
  props<{ error: string }>()
);

export const loadLeaveHistory = createAction(
  '[Leave] Load Leave History',
  props<{ params?: { employeeId?: number; status?: string; year?: number; page?: number; size?: number } }>()
);
export const loadLeaveHistorySuccess = createAction(
  '[Leave] Load Leave History Success',
  props<{ response: PagedResponse<LeaveRequest> }>()
);
export const loadLeaveHistoryFailure = createAction(
  '[Leave] Load Leave History Failure',
  props<{ error: string }>()
);

export const loadPendingApprovals = createAction('[Leave] Load Pending Approvals');
export const loadPendingApprovalsSuccess = createAction(
  '[Leave] Load Pending Approvals Success',
  props<{ requests: LeaveRequest[] }>()
);
export const loadPendingApprovalsFailure = createAction(
  '[Leave] Load Pending Approvals Failure',
  props<{ error: string }>()
);

export const loadTeamCalendar = createAction(
  '[Leave] Load Team Calendar',
  props<{ startDate?: string; endDate?: string; departmentId?: number }>()
);
export const loadTeamCalendarSuccess = createAction(
  '[Leave] Load Team Calendar Success',
  props<{ items: TeamLeaveCalendarItem[] }>()
);
export const loadTeamCalendarFailure = createAction(
  '[Leave] Load Team Calendar Failure',
  props<{ error: string }>()
);
