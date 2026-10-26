package com.employee.leave.dto.response;

import com.employee.leave.enums.LeaveRequestStatus;
import com.employee.leave.enums.LeaveTypeCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamLeaveCalendarDto {

    private Long leaveRequestId;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private Long departmentId;
    private LeaveTypeCode leaveTypeCode;
    private String leaveTypeName;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal totalDays;
    private LeaveRequestStatus status;
}
