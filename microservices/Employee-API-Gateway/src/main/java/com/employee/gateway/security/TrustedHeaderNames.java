package com.employee.gateway.security;

public final class TrustedHeaderNames {

    public static final String USER_ID = "X-User-Id";
    public static final String EMPLOYEE_ID = "X-Employee-Id";
    public static final String USER_EMAIL = "X-User-Email";
    public static final String USER_ROLE = "X-User-Role";
    public static final String GATEWAY_AUTHENTICATED = "X-Gateway-Authenticated";
    public static final String CORRELATION_ID = "X-Correlation-Id";

    private TrustedHeaderNames() {
    }
}
