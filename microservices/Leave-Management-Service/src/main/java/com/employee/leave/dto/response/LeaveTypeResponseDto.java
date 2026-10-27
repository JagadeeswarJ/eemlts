package com.employee.leave.dto.response;

import com.employee.leave.enums.LeaveTypeCode;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeResponseDto {

    private Long leaveTypeId;
    private LeaveTypeCode code;
    private String name;
    private String description;
    private Integer annualQuota;
    private Boolean isCarryForward;
    private Boolean isActive;
}
