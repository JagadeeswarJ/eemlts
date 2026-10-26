import { createReducer, on } from '@ngrx/store';
import {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  TeamLeaveCalendarItem,
} from '../../core/models/leave.models';
import * as LeaveActions from './leave.actions';

export interface LeaveState {
  types: LeaveType[];
  balances: LeaveBalance[];
  history: LeaveRequest[];
  pendingApprovals: LeaveRequest[];
  calendarItems: TeamLeaveCalendarItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  loading: boolean;
  error: string | null;
  actionSuccess: boolean;
}

export const initialLeaveState: LeaveState = {
  types: [],
  balances: [],
  history: [],
  pendingApprovals: [],
  calendarItems: [],
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 10,
  loading: false,
  error: null,
  actionSuccess: false,
};

export const leaveReducer = createReducer(
  initialLeaveState,
  on(LeaveActions.loadLeaveTypesSuccess, (state, { types }) => ({ ...state, types })),

  on(LeaveActions.loadLeaveBalancesSuccess, (state, { balances }) => ({ ...state, balances })),

  on(LeaveActions.applyLeave, (state) => ({ ...state, loading: true, error: null, actionSuccess: false })),
  on(LeaveActions.applyLeaveSuccess, (state, { request }) => ({
    ...state,
    loading: false,
    actionSuccess: true,
    history: [request, ...state.history],
  })),
  on(LeaveActions.applyLeaveFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LeaveActions.cancelLeaveSuccess, (state, { request }) => ({
    ...state,
    actionSuccess: true,
    history: state.history.map((r) => (r.leaveRequestId === request.leaveRequestId ? request : r)),
  })),

  on(LeaveActions.approveLeaveSuccess, (state, { request }) => ({
    ...state,
    actionSuccess: true,
    pendingApprovals: state.pendingApprovals.filter((r) => r.leaveRequestId !== request.leaveRequestId),
    history: state.history.map((r) => (r.leaveRequestId === request.leaveRequestId ? request : r)),
  })),

  on(LeaveActions.rejectLeaveSuccess, (state, { request }) => ({
    ...state,
    actionSuccess: true,
    pendingApprovals: state.pendingApprovals.filter((r) => r.leaveRequestId !== request.leaveRequestId),
    history: state.history.map((r) => (r.leaveRequestId === request.leaveRequestId ? request : r)),
  })),

  on(LeaveActions.loadLeaveHistory, (state) => ({ ...state, loading: true, error: null })),
  on(LeaveActions.loadLeaveHistorySuccess, (state, { response }) => ({
    ...state,
    loading: false,
    history: response.content,
    totalElements: response.totalElements,
    totalPages: response.totalPages,
    currentPage: response.page,
    pageSize: response.size,
  })),
  on(LeaveActions.loadLeaveHistoryFailure, (state, { error }) => ({ ...state, loading: false, error })),

  on(LeaveActions.loadPendingApprovalsSuccess, (state, { requests }) => ({
    ...state,
    pendingApprovals: requests,
  })),

  on(LeaveActions.loadTeamCalendarSuccess, (state, { items }) => ({
    ...state,
    calendarItems: items,
  }))
);
