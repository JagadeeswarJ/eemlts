package com.employee.management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManagerResponseDto {

    private Long employeeId;
    private String employeeCode;
    private String fullName;
    private String email;
    private String designation;
    private String departmentName;
}
