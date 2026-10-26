export type LeaveTypeCode = 'CASUAL' | 'SICK' | 'EARNED' | 'COMPENSATORY' | 'BEREAVEMENT' | 'UNPAID' | 'MATERNITY' | 'PATERNITY' | 'SPECIAL';
export type LeaveRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';

export interface LeaveType {
  leaveTypeId: number;
  code: LeaveTypeCode;
  name: string;
  description: string;
  annualQuota: number;
  isCarryForward: boolean;
  isActive?: boolean;
}

export interface CreateLeaveTypeRequest {
  code: LeaveTypeCode;
  name: string;
  description?: string;
  annualQuota: number;
  isCarryForward?: boolean;
}

export interface UpdateLeaveTypeRequest {
  name: string;
  description?: string;
  annualQuota: number;
  isCarryForward?: boolean;
}

export interface LeaveBalance {
  balanceId: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
  updatedAt: string;
}

export interface LeaveRequest {
  leaveRequestId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  leaveTypeId: number;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveRequestStatus;
  approverId: number | null;
  approverName: string;
  approverComments: string | null;
  decisionDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApplyLeaveRequest {
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface LeaveDecisionRequest {
  comment?: string;
}

export interface TeamLeaveCalendarItem {
  leaveRequestId: number;
  employeeId: number;
  employeeCode: string;
  employeeName: string;
  departmentId: number;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveRequestStatus;
}

export interface AdjustLeaveBalanceRequest {
  year: number;
  newTotal: number;
  reason: string;
}

export interface LeaveBalanceAdjustment {
  adjustmentId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  leaveTypeId: number;
  leaveTypeName: string;
  year: number;
  previousTotal: number;
  newTotal: number;
  reason: string;
  performedBy: string;
  performedAt: string;
}

export interface AdminLeaveBalance {
  balanceId: number;
  employeeId: number;
  employeeName: string;
  employeeCode: string;
  departmentId: number;
  departmentName: string;
  leaveTypeId: number;
  leaveTypeCode: LeaveTypeCode;
  leaveTypeName: string;
  year: number;
  totalDays: number;
  usedDays: number;
  pendingDays: number;
  availableDays: number;
}
