import { describe, expect, it } from 'vitest';
import { AttendanceRecord } from '../../core/models/attendance.models';
import * as AttendanceActions from './attendance.actions';
import { attendanceReducer, initialAttendanceState } from './attendance.reducer';

describe('Attendance Reducer', () => {
  const mockRecord: AttendanceRecord = {
    attendanceId: 101,
    employeeId: 4,
    employeeCode: 'EMP004',
    employeeName: 'Alex Jones',
    attendanceDate: '2026-10-22',
    checkInTime: '2026-10-22T09:00:00',
    checkOutTime: null,
    totalHours: 0,
    status: 'PRESENT',
    canCheckIn: false,
    canCheckOut: true,
    createdAt: '',
    updatedAt: '',
  };

  it('should update todayRecord on checkInSuccess', () => {
    const action = AttendanceActions.checkInSuccess({ record: mockRecord });
    const state = attendanceReducer(initialAttendanceState, action);

    expect(state.todayRecord).toEqual(mockRecord);
    expect(state.actionSuccess).toBe(true);
    expect(state.loading).toBe(false);
  });

  it('should update todayRecord on checkOutSuccess', () => {
    const updatedRecord = { ...mockRecord, checkOutTime: '2026-10-22T17:30:00', totalHours: 8.5 };
    const action = AttendanceActions.checkOutSuccess({ record: updatedRecord });
    const state = attendanceReducer(initialAttendanceState, action);

    expect(state.todayRecord?.totalHours).toBe(8.5);
    expect(state.actionSuccess).toBe(true);
  });
});
