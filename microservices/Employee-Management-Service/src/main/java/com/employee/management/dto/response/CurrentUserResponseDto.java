package com.employee.management.dto.response;

import com.employee.management.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurrentUserResponseDto {

    private Long userId;
    private Long employeeId;
    private String employeeCode;
    private String email;
    private Role role;
    private String firstName;
    private String lastName;
    private String fullName;
    private Long departmentId;
    private String departmentName;
    private String designation;
}
