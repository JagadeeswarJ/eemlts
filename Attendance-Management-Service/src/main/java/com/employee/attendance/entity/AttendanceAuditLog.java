package com.employee.attendance.entity;

import com.employee.attendance.enums.AuditAction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("attendance_audit_logs")
public class AttendanceAuditLog {

    @Id
    @Column("audit_id")
    private Long auditId;

    @Column("attendance_id")
    private Long attendanceId;

    @Column("employee_id")
    private Long employeeId;

    @Column("action")
    private AuditAction action;

    @Column("previous_status")
    private String previousStatus;

    @Column("new_status")
    private String newStatus;

    @Column("reason")
    private String reason;

    @Column("performed_by")
    private String performedBy;

    @Column("created_at")
    private LocalDateTime createdAt;
}
