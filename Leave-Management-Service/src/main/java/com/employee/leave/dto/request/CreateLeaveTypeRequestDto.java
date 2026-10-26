package com.employee.leave.dto.request;

import com.employee.leave.enums.LeaveTypeCode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateLeaveTypeRequestDto {

    @NotNull(message = "Leave type code is required")
    private LeaveTypeCode code;

    @NotBlank(message = "Leave type display name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotNull(message = "Annual quota is required")
    @Min(value = 0, message = "Annual quota cannot be negative")
    private Integer annualQuota;

    private Boolean isCarryForward;
}
