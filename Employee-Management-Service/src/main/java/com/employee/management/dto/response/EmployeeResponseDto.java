package com.employee.management.dto.response;

import com.employee.management.enums.EmploymentStatus;
import com.employee.management.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeResponseDto {

    private Long employeeId;
    private Long userId;
    private String employeeCode;
    private String firstName;
    private String lastName;
    private String fullName;
    private String email;
    private String phone;
    private Long departmentId;
    private String departmentName;
    private String designation;
    private LocalDate joiningDate;
    private EmploymentStatus employmentStatus;
    private Long managerId;
    private String managerName;
    private String address;
    private String emergencyContact;
    private Role role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
