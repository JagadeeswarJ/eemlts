package com.employee.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveReportDto {

    private String leaveTypeCode;
    private String leaveTypeName;
    private BigDecimal totalAllocatedDays;
    private BigDecimal totalUsedDays;
    private BigDecimal totalPendingDays;
    private BigDecimal totalAvailableDays;
    private double utilizationRate;
}
