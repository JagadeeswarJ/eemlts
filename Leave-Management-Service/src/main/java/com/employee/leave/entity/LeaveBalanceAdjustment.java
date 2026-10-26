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
@Table("leave_balance_adjustments")
public class LeaveBalanceAdjustment {

    @Id
    @Column("adjustment_id")
    private Long adjustmentId;

    @Column("employee_id")
    private Long employeeId;

    @Column("leave_type_id")
    private Long leaveTypeId;

    @Column("year")
    private Integer year;

    @Column("previous_total")
    private BigDecimal previousTotal;

    @Column("new_total")
    private BigDecimal newTotal;

    @Column("reason")
    private String reason;

    @Column("performed_by")
    private String performedBy;

    @Column("performed_at")
    private LocalDateTime performedAt;
}
