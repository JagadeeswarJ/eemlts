import { describe, expect, it } from 'vitest';
import { AttendanceState } from './attendance.reducer';
import * as AttendanceSelectors from './attendance.selectors';

describe('Attendance Selectors', () => {
  const state: AttendanceState = {
    todayRecord: null,
    history: [],
    totalElements: 10,
    totalPages: 1,
    currentPage: 0,
    pageSize: 10,
    stats: null,
    dailySummary: null,
    auditLogs: [],
    loading: false,
    error: null,
    actionSuccess: true,
  };

  it('should select today record', () => {
    expect(AttendanceSelectors.selectTodayAttendance.projector(state)).toBeNull();
  });

  it('should select action success', () => {
    expect(AttendanceSelectors.selectAttendanceActionSuccess.projector(state)).toBe(true);
  });
});
