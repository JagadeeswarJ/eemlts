package com.employee.attendance.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCorrectionDecisionDto {

    @NotNull(message = "Approval decision is required")
    private Boolean approved;

    private String comment;
}
