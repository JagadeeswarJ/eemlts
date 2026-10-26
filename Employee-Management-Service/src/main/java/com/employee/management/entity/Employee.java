package com.employee.management.entity;

import com.employee.management.enums.EmploymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

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

    @Column("phone")
    private String phone;

    @Column("department_id")
    private Long departmentId;

    @Column("designation")
    private String designation;

    @Column("joining_date")
    private LocalDate joiningDate;

    @Column("employment_status")
    private EmploymentStatus employmentStatus;

    @Column("manager_id")
    private Long managerId;

    @Column("address")
    private String address;

    @Column("emergency_contact")
    private String emergencyContact;

    @Column("created_at")
    private LocalDateTime createdAt;

    @Column("updated_at")
    private LocalDateTime updatedAt;
}
