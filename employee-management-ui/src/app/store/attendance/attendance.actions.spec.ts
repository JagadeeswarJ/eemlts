import { describe, expect, it } from 'vitest';
import * as AttendanceActions from './attendance.actions';

describe('Attendance Actions', () => {
  it('should create checkIn action', () => {
    const action = AttendanceActions.checkIn();
    expect(action.type).toBe('[Attendance] Check In');
  });

  it('should create checkOut action', () => {
    const action = AttendanceActions.checkOut();
    expect(action.type).toBe('[Attendance] Check Out');
  });

  it('should create loadTodayAttendance action', () => {
    const action = AttendanceActions.loadTodayAttendance({ employeeId: 4 });
    expect(action.type).toBe('[Attendance] Load Today Attendance');
    expect(action.employeeId).toBe(4);
  });
});
