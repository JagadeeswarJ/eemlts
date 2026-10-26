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
@Table("attendance_records")
public class AttendanceRecord {

    @Id
    @Column("attendance_id")
    private Long attendanceId;

    @Column("employee_id")
    private Long employeeId;

    @Column("attendance_date")
    private LocalDate attendanceDate;

    @Column("check_in_time")
    private LocalDateTime checkInTime;

    @Column("check_out_time")
    private LocalDateTime checkOutTime;

    @Column("total_hours")
    private BigDecimal totalHours;

    @Column("status")
    private String status;
}
