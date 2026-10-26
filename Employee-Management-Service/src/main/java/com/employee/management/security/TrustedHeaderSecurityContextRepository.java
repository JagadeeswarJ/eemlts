package com.employee.management.security;

import com.employee.management.enums.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpCookie;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.context.ServerSecurityContextRepository;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;

@Component
@RequiredArgsConstructor
public class TrustedHeaderSecurityContextRepository implements ServerSecurityContextRepository {

    private static final String COOKIE_EMP_ACCESS_TOKEN = "emp_access_token";
    private static final String COOKIE_ACCESS_TOKEN = "access_token";

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> save(ServerWebExchange exchange, SecurityContext context) {
        return Mono.empty();
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        return Mono.defer(() -> {
            // 1. Try Trusted Headers forwarded by API Gateway
            String gatewayAuth = getHeader(exchange, TrustedHeaderNames.GATEWAY_AUTHENTICATED);
            if ("true".equalsIgnoreCase(gatewayAuth)) {
                String userIdHeader = getHeader(exchange, TrustedHeaderNames.USER_ID);
                String employeeIdHeader = getHeader(exchange, TrustedHeaderNames.EMPLOYEE_ID);
                String email = getHeader(exchange, TrustedHeaderNames.USER_EMAIL);
                String roleHeader = getHeader(exchange, TrustedHeaderNames.USER_ROLE);

                if (userIdHeader != null && email != null && roleHeader != null) {
                    try {
                        Long userId = Long.valueOf(userIdHeader);
                        Long employeeId = employeeIdHeader != null && !employeeIdHeader.isBlank()
                                ? Long.valueOf(employeeIdHeader) : null;
                        Role role = Role.valueOf(roleHeader.trim().toUpperCase());

                        RequestUser requestUser = RequestUser.builder()
                                .userId(userId)
                                .employeeId(employeeId)
                                .email(email)
                                .role(role)
                                .build();

                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                requestUser,
                                null,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
                        );

                        return Mono.just(new SecurityContextImpl(authentication));
                    } catch (Exception ignored) {
                    }
                }
            }

            // 2. Direct token verification (Fallback for direct calls / local tests)
            String token = extractToken(exchange);
            if (token != null && jwtUtil.isTokenValid(token)) {
                try {
                    Long userId = jwtUtil.extractUserId(token);
                    Long employeeId = jwtUtil.extractEmployeeId(token);
                    String email = jwtUtil.extractEmail(token);
                    Role role = jwtUtil.extractRole(token);

                    if (role != null) {
                        RequestUser requestUser = RequestUser.builder()
                                .userId(userId)
                                .employeeId(employeeId)
                                .email(email)
                                .role(role)
                                .build();

                        Authentication authentication = new UsernamePasswordAuthenticationToken(
                                requestUser,
                                token,
                                List.of(new SimpleGrantedAuthority("ROLE_" + role.name()))
                        );

                        return Mono.just(new SecurityContextImpl(authentication));
                    }
                } catch (Exception ignored) {
                }
            }

            return Mono.empty();
        });
    }

    private String getHeader(ServerWebExchange exchange, String headerName) {
        return exchange.getRequest().getHeaders().getFirst(headerName);
    }

    private String extractToken(ServerWebExchange exchange) {
        HttpCookie empCookie = exchange.getRequest().getCookies().getFirst(COOKIE_EMP_ACCESS_TOKEN);
        if (empCookie != null && !empCookie.getValue().isBlank()) {
            return empCookie.getValue().trim();
        }

        HttpCookie tokenCookie = exchange.getRequest().getCookies().getFirst(COOKIE_ACCESS_TOKEN);
        if (tokenCookie != null && !tokenCookie.getValue().isBlank()) {
            return tokenCookie.getValue().trim();
        }

        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        return null;
    }
}
