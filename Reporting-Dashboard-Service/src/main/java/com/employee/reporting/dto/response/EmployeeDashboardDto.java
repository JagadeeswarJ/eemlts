package com.employee.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDashboardDto {

    private ProfileSummary profile;
    private AttendanceSummary attendanceSummary;
    private List<LeaveBalanceSummary> leaveBalances;
    private List<RecentLeaveRequestItem> recentRequests;
    private List<RecentAttendanceItem> recentAttendance;
    private List<HolidayItem> upcomingHolidays;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileSummary {
        private Long employeeId;
        private String employeeCode;
        private String fullName;
        private String email;
        private String designation;
        private String departmentName;
        private String managerName;
        private LocalDate joiningDate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AttendanceSummary {
        private String todayStatus;
        private LocalDateTime checkInTime;
        private LocalDateTime checkOutTime;
        private BigDecimal hoursToday;
        private BigDecimal monthlyTotalHours;
        private long presentDaysThisMonth;
        private double attendancePercentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveBalanceSummary {
        private String leaveTypeCode;
        private String leaveTypeName;
        private BigDecimal totalDays;
        private BigDecimal usedDays;
        private BigDecimal pendingDays;
        private BigDecimal availableDays;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentLeaveRequestItem {
        private Long leaveRequestId;
        private String leaveTypeName;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalDays;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentAttendanceItem {
        private LocalDate date;
        private String checkInTime;
        private String checkOutTime;
        private BigDecimal totalHours;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class HolidayItem {
        private String name;
        private LocalDate date;
        private String dayOfWeek;
    }
}
