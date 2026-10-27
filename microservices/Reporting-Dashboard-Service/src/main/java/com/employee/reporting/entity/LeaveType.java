package com.employee.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("leave_types")
public class LeaveType {

    @Id
    @Column("leave_type_id")
    private Long leaveTypeId;

    @Column("code")
    private String code;

    @Column("name")
    private String name;

    @Column("annual_quota")
    private Integer annualQuota;
}
