package com.employee.gateway.filter;

import com.employee.gateway.security.GatewayAuthenticatedUser;
import com.employee.gateway.security.TrustedHeaderNames;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class TrustedHeaderFilter implements GlobalFilter, Ordered {

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE - 10;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(SecurityContext::getAuthentication)
                .filter(this::isValidAuthentication)
                .map(Authentication::getPrincipal)
                .cast(GatewayAuthenticatedUser.class)
                .map(user -> addTrustedHeaders(exchange, user))
                .defaultIfEmpty(removeTrustedHeaders(exchange))
                .flatMap(chain::filter);
    }

    private boolean isValidAuthentication(Authentication auth) {
        return auth != null && auth.isAuthenticated() && auth.getPrincipal() instanceof GatewayAuthenticatedUser;
    }

    private ServerWebExchange addTrustedHeaders(ServerWebExchange exchange, GatewayAuthenticatedUser user) {
        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(headers -> {
                    cleanHeaders(headers);
                    if (user.getUserId() != null) {
                        headers.set(TrustedHeaderNames.USER_ID, String.valueOf(user.getUserId()));
                    }
                    if (user.getEmployeeId() != null) {
                        headers.set(TrustedHeaderNames.EMPLOYEE_ID, String.valueOf(user.getEmployeeId()));
                    }
                    if (user.getEmail() != null) {
                        headers.set(TrustedHeaderNames.USER_EMAIL, user.getEmail());
                    }
                    if (user.getRole() != null) {
                        headers.set(TrustedHeaderNames.USER_ROLE, user.getRole());
                    }
                    headers.set(TrustedHeaderNames.GATEWAY_AUTHENTICATED, "true");
                })
                .build();

        return exchange.mutate().request(request).build();
    }

    private ServerWebExchange removeTrustedHeaders(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest().mutate()
                .headers(this::cleanHeaders)
                .build();

        return exchange.mutate().request(request).build();
    }

    private void cleanHeaders(HttpHeaders headers) {
        headers.remove(TrustedHeaderNames.USER_ID);
        headers.remove(TrustedHeaderNames.EMPLOYEE_ID);
        headers.remove(TrustedHeaderNames.USER_EMAIL);
        headers.remove(TrustedHeaderNames.USER_ROLE);
        headers.remove(TrustedHeaderNames.GATEWAY_AUTHENTICATED);
    }
}
