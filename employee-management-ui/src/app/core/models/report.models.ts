export interface EmployeeDashboard {
  profile: {
    employeeId: number;
    employeeCode: string;
    fullName: string;
    email: string;
    designation: string;
    departmentName: string;
    managerName: string;
    joiningDate: string;
  };
  attendanceSummary: {
    todayStatus: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    hoursToday: number;
    monthlyTotalHours: number;
    presentDaysThisMonth: number;
    attendancePercentage: number;
  };
  leaveBalances: Array<{
    leaveTypeCode: string;
    leaveTypeName: string;
    totalDays: number;
    usedDays: number;
    pendingDays: number;
    availableDays: number;
  }>;
  recentRequests: Array<{
    leaveRequestId: number;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: string;
  }>;
  recentAttendance: Array<{
    date: string;
    checkInTime: string;
    checkOutTime: string;
    totalHours: number;
    status: string;
  }>;
  upcomingHolidays: Array<{
    name: string;
    date: string;
    dayOfWeek: string;
  }>;
}

export interface ManagerDashboard {
  departmentName: string;
  totalTeamMembers: number;
  presentToday: number;
  onLeaveToday: number;
  absentToday: number;
  teamAttendancePercentage: number;
  pendingApprovalsCount: number;
  pendingApprovals: Array<{
    leaveRequestId: number;
    employeeId: number;
    employeeName: string;
    leaveTypeName: string;
    startDate: string;
    endDate: string;
    totalDays: number;
    reason: string;
  }>;
  leaveTrends: Array<{
    month: string;
    leaveCount: number;
  }>;
}

export interface HrDashboard {
  totalEmployees: number;
  activeEmployees: number;
  inactiveEmployees: number;
  companyWideAttendanceRate: number;
  averageDailyWorkingHours: number;
  totalApprovedLeaves: number;
  totalPendingLeaves: number;
  totalRejectedLeaves: number;
  departmentDistribution: Array<{
    departmentId: number;
    departmentName: string;
    employeeCount: number;
    percentage: number;
  }>;
  leaveTypeMetrics: Array<{
    leaveTypeCode: string;
    leaveTypeName: string;
    totalDaysConsumed: number;
    requestsCount: number;
  }>;
}

export interface DepartmentReport {
  departmentId: number;
  name: string;
  code: string;
  managerName: string;
  totalEmployees: number;
  presentToday: number;
  onLeaveToday: number;
  absentToday: number;
  attendanceRate: number;
}

export interface AttendanceReport {
  month: string;
  year: number;
  totalRecords: number;
  presentDays: number;
  halfDays: number;
  absentDays: number;
  totalHours: number;
  averageHours: number;
  overallPercentage: number;
}

export interface LeaveReport {
  leaveTypeCode: string;
  leaveTypeName: string;
  totalAllocatedDays: number;
  totalUsedDays: number;
  totalPendingDays: number;
  totalAvailableDays: number;
  utilizationRate: number;
}
