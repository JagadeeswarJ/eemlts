package com.employee.leave.dto.response;

import com.employee.leave.enums.LeaveTypeCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveBalanceResponseDto {

    private Long balanceId;
    private Long employeeId;
    private Long leaveTypeId;
    private LeaveTypeCode leaveTypeCode;
    private String leaveTypeName;
    private Integer year;
    private BigDecimal totalDays;
    private BigDecimal usedDays;
    private BigDecimal pendingDays;
    private BigDecimal availableDays;
    private LocalDateTime updatedAt;
}
