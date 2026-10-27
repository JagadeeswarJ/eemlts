package com.employee.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("leave_requests")
public class LeaveRequest {

    @Id
    @Column("leave_request_id")
    private Long leaveRequestId;

    @Column("employee_id")
    private Long employeeId;

    @Column("leave_type_id")
    private Long leaveTypeId;

    @Column("start_date")
    private LocalDate startDate;

    @Column("end_date")
    private LocalDate endDate;

    @Column("total_days")
    private BigDecimal totalDays;

    @Column("reason")
    private String reason;

    @Column("status")
    private String status;

    @Column("created_at")
    private LocalDateTime createdAt;
}
