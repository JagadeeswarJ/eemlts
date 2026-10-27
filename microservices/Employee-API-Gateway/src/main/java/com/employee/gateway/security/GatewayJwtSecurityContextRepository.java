package com.employee.gateway.security;

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
import java.util.Set;

@Component
@RequiredArgsConstructor
public class GatewayJwtSecurityContextRepository implements ServerSecurityContextRepository {

    private static final String COOKIE_EMP_ACCESS_TOKEN = "emp_access_token";
    private static final String COOKIE_ACCESS_TOKEN = "access_token";

    private static final Set<String> ALLOWED_ROLES = Set.of(
            "ADMIN",
            "HR",
            "MANAGER",
            "EMPLOYEE"
    );

    private final JwtUtil jwtUtil;

    @Override
    public Mono<Void> save(ServerWebExchange exchange, SecurityContext context) {
        return Mono.empty();
    }

    @Override
    public Mono<SecurityContext> load(ServerWebExchange exchange) {
        String token = extractToken(exchange);

        if (token == null || token.isBlank() || !jwtUtil.isTokenValid(token)) {
            return Mono.empty();
        }

        try {
            Long userId = jwtUtil.extractUserId(token);
            Long employeeId = jwtUtil.extractEmployeeId(token);
            String email = jwtUtil.extractEmail(token);
            String role = jwtUtil.extractRole(token);

            if (role == null) {
                return Mono.empty();
            }

            String normalizedRole = role.trim().toUpperCase();
            if (!ALLOWED_ROLES.contains(normalizedRole)) {
                return Mono.empty();
            }

            GatewayAuthenticatedUser authenticatedUser = GatewayAuthenticatedUser.builder()
                    .userId(userId)
                    .employeeId(employeeId)
                    .email(email)
                    .role(normalizedRole)
                    .build();

            List<SimpleGrantedAuthority> authorities = List.of(
                    new SimpleGrantedAuthority("ROLE_" + normalizedRole)
            );

            Authentication authentication = new UsernamePasswordAuthenticationToken(
                    authenticatedUser,
                    token,
                    authorities
            );

            return Mono.just(new SecurityContextImpl(authentication));
        } catch (Exception e) {
            return Mono.empty();
        }
    }

    private String extractToken(ServerWebExchange exchange) {
        // 1. Try emp_access_token cookie
        HttpCookie empCookie = exchange.getRequest().getCookies().getFirst(COOKIE_EMP_ACCESS_TOKEN);
        if (empCookie != null && !empCookie.getValue().isBlank()) {
            return empCookie.getValue().trim();
        }

        // 2. Try access_token cookie
        HttpCookie accessTokenCookie = exchange.getRequest().getCookies().getFirst(COOKIE_ACCESS_TOKEN);
        if (accessTokenCookie != null && !accessTokenCookie.getValue().isBlank()) {
            return accessTokenCookie.getValue().trim();
        }

        // 3. Try Authorization: Bearer header
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7).trim();
        }

        return null;
    }
}
