package com.employee.attendance.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceStatsResponseDto {

    private long totalDays;
    private long presentDays;
    private long halfDays;
    private long absentDays;
    private long onLeaveDays;
    private BigDecimal totalWorkingHours;
    private BigDecimal averageWorkingHours;
    private double attendancePercentage;
}
