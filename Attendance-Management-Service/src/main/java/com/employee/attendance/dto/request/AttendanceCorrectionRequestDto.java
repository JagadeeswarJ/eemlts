package com.employee.attendance.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceCorrectionRequestDto {

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    @NotNull(message = "Proposed check-in time is required")
    private LocalDateTime proposedCheckInTime;

    private LocalDateTime proposedCheckOutTime;

    @NotBlank(message = "Reason for attendance correction is required")
    private String reason;
}
