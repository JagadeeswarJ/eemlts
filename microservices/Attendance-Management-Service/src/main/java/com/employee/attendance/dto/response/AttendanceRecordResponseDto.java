package com.employee.attendance.dto.response;

import com.employee.attendance.enums.AttendanceStatus;
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
public class AttendanceRecordResponseDto {

    private Long attendanceId;
    private Long employeeId;
    private String employeeCode;
    private String employeeName;
    private LocalDate attendanceDate;
    private LocalDateTime checkInTime;
    private LocalDateTime checkOutTime;
    private BigDecimal totalHours;
    private AttendanceStatus status;
    private boolean canCheckIn;
    private boolean canCheckOut;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
