package com.employee.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerDashboardDto {

    private String departmentName;
    private long totalTeamMembers;
    private long presentToday;
    private long onLeaveToday;
    private long absentToday;
    private double teamAttendancePercentage;
    private long pendingApprovalsCount;
    private List<PendingApprovalItem> pendingApprovals;
    private List<MonthlyLeaveTrendItem> leaveTrends;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PendingApprovalItem {
        private Long leaveRequestId;
        private Long employeeId;
        private String employeeName;
        private String leaveTypeName;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal totalDays;
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyLeaveTrendItem {
        private String month;
        private long leaveCount;
    }
}
