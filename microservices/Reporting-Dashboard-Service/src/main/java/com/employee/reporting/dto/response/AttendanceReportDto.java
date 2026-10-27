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
public class AttendanceReportDto {

    private String month;
    private int year;
    private long totalRecords;
    private long presentDays;
    private long halfDays;
    private long absentDays;
    private BigDecimal totalHours;
    private BigDecimal averageHours;
    private double overallPercentage;
}
