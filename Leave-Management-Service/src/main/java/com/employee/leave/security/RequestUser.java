package com.employee.leave.security;

import com.employee.leave.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestUser implements Serializable {

    private Long userId;
    private Long employeeId;
    private String email;
    private Role role;
}
