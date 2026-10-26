package com.employee.leave.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaveTypeStatusRequestDto {

    @NotNull(message = "Active status flag is required")
    private Boolean isActive;
}
