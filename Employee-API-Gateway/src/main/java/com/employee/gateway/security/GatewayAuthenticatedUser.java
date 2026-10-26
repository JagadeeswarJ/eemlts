package com.employee.gateway.security;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GatewayAuthenticatedUser implements Serializable {

    private Long userId;
    private Long employeeId;
    private String email;
    private String role;
}
