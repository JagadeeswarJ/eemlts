package com.employee.attendance.dto.response;

import com.employee.attendance.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttendanceAuditLogResponseDto {

    private Long auditId;
    private Long attendanceId;
    private Long employeeId;
    private String employeeName;
    private AuditAction action;
    private String previousStatus;
    private String newStatus;
    private String reason;
    private String performedBy;
    private LocalDateTime createdAt;
}
