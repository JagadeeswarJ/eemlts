package com.employee.leave.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("leave_balances")
public class LeaveBalance {

    @Id
    @Column("balance_id")
    private Long balanceId;

    @Column("employee_id")
    private Long employeeId;

    @Column("leave_type_id")
    private Long leaveTypeId;

    @Column("year")
    private Integer year;

    @Column("total_days")
    private BigDecimal totalDays;

    @Column("used_days")
    private BigDecimal usedDays;

    @Column("pending_days")
    private BigDecimal pendingDays;

    @Column("available_days")
    private BigDecimal availableDays;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
