package com.employee.reporting.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("employees")
public class Employee {

    @Id
    @Column("employee_id")
    private Long employeeId;

    @Column("user_id")
    private Long userId;

    @Column("employee_code")
    private String employeeCode;

    @Column("first_name")
    private String firstName;

    @Column("last_name")
    private String lastName;

    @Column("email")
    private String email;

    @Column("department_id")
    private Long departmentId;

    @Column("designation")
    private String designation;

    @Column("joining_date")
    private LocalDate joiningDate;

    @Column("employment_status")
    private String employmentStatus;

    @Column("manager_id")
    private Long managerId;
}
