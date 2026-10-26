import { describe, expect, it } from 'vitest';
import { AttendanceRecord, AttendanceStats, AttendanceAuditLog } from './attendance.models';

describe('Attendance Models', () => {
  it('should instantiate valid AttendanceRecord model', () => {
    const record: AttendanceRecord = {
      attendanceId: 101,
      employeeId: 4,
      employeeCode: 'EMP004',
      employeeName: 'Alex Jones',
      attendanceDate: '2026-10-22',
      checkInTime: '2026-10-22T09:00:00',
      checkOutTime: '2026-10-22T17:30:00',
      totalHours: 8.5,
      status: 'PRESENT',
      canCheckIn: false,
      canCheckOut: false,
      createdAt: '',
      updatedAt: '',
    };
    expect(record.status).toBe('PRESENT');
    expect(record.totalHours).toBe(8.5);
  });

  it('should instantiate valid AttendanceStats model', () => {
    const stats: AttendanceStats = {
      totalDays: 20,
      presentDays: 18,
      halfDays: 1,
      absentDays: 1,
      onLeaveDays: 0,
      totalWorkingHours: 153.0,
      averageWorkingHours: 8.5,
      attendancePercentage: 92.5,
    };
    expect(stats.presentDays).toBe(18);
    expect(stats.attendancePercentage).toBe(92.5);
  });
});
