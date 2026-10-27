package com.employee.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HrDashboardDto {

    private long totalEmployees;
    private long activeEmployees;
    private long inactiveEmployees;
    private double companyWideAttendanceRate;
    private BigDecimal averageDailyWorkingHours;
    private long totalApprovedLeaves;
    private long totalPendingLeaves;
    private long totalRejectedLeaves;
    private List<DepartmentDistributionItem> departmentDistribution;
    private List<LeaveTypeMetricItem> leaveTypeMetrics;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DepartmentDistributionItem {
        private Long departmentId;
        private String departmentName;
        private long employeeCount;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LeaveTypeMetricItem {
        private String leaveTypeCode;
        private String leaveTypeName;
        private BigDecimal totalDaysConsumed;
        private long requestsCount;
    }
}
