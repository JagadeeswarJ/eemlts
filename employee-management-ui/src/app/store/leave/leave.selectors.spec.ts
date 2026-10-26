import { describe, expect, it } from 'vitest';
import { LeaveState } from './leave.reducer';
import * as LeaveSelectors from './leave.selectors';

describe('Leave Selectors', () => {
  const state: LeaveState = {
    types: [],
    balances: [],
    history: [],
    pendingApprovals: [],
    calendarItems: [],
    totalElements: 5,
    totalPages: 1,
    currentPage: 0,
    pageSize: 10,
    loading: false,
    error: null,
    actionSuccess: false,
  };

  it('should select types array', () => {
    expect(LeaveSelectors.selectLeaveTypes.projector(state)).toEqual([]);
  });

  it('should select balances array', () => {
    expect(LeaveSelectors.selectLeaveBalances.projector(state)).toEqual([]);
  });
});
