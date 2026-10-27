package com.employee.leave.dto.response;

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
public class LeaveBalanceAdjustmentResponseDto {

    private Long adjustmentId;
    private Long employeeId;
    private String employeeName;
    private String employeeCode;
    private Long leaveTypeId;
    private String leaveTypeName;
    private Integer year;
    private BigDecimal previousTotal;
    private BigDecimal newTotal;
    private String reason;
    private String performedBy;
    private LocalDateTime performedAt;
}
