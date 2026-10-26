package com.employee.leave.dto.response;

import com.employee.leave.enums.LeaveTypeCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminLeaveBalanceResponseDto {

    private Long balanceId;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private Long departmentId;
    private String departmentName;
    private Long leaveTypeId;
    private LeaveTypeCode leaveTypeCode;
    private String leaveTypeName;
    private Integer year;
    private BigDecimal totalDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private BigDecimal availableDays;
}
