package com.employee.leave.dto.response;

import com.employee.leave.enums.LeaveRequestStatus;
import com.employee.leave.enums.LeaveTypeCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveRequestResponseDto {

    private Long leaveRequestId;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private Long leaveTypeId;
    private LeaveTypeCode leaveTypeCode;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private String reason;
    private LeaveRequestStatus status;
    private Long approverId;
    private String approverName;
    private String approverComments;
    private LocalDateTime decisionDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
