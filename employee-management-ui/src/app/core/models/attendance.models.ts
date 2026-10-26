export type AttendanceStatus = 'PRESENT' | 'HALF_DAY' | 'ABSENT' | 'ON_LEAVE';
export type AuditAction = 'CHECK_IN' | 'CHECK_OUT' | 'CORRECTION_REQUEST' | 'CORRECTION_APPROVED' | 'CORRECTION_REJECTED' | 'MANUAL_ADJUSTMENT';

export interface AttendanceRecord {
  attendanceId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  attendanceDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  totalHours: number;
  status: AttendanceStatus;
  canCheckIn: boolean;
  canCheckOut: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  totalDays: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  onLeaveDays: number;
  totalWorkingHours: number;
  averageWorkingHours: number;
  attendancePercentage: number;
}

export interface AttendanceAuditLog {
  auditId: number;
  attendanceId: number | null;
  employeeId: number;
  employeeName: string;
  action: AuditAction;
  previousStatus: string | null;
  newStatus: string;
  reason: string;
  performedBy: string;
  createdAt: string;
}

export interface DailyAttendanceSummary {
  date: string;
  totalEmployees: number;
  presentCount: number;
  halfDayCount: number;
  onLeaveCount: number;
  absentCount: number;
  records: AttendanceRecord[];
}

export interface AttendanceCorrectionRequest {
  attendanceDate: string;
  proposedCheckInTime: string;
  proposedCheckOutTime?: string;
  reason: string;
}

export interface AttendanceCorrectionDecision {
  approved: boolean;
  comment?: string;
}
