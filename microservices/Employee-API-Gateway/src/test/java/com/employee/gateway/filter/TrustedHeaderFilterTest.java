package com.employee.gateway.filter;

import com.employee.gateway.security.GatewayAuthenticatedUser;
import com.employee.gateway.security.TrustedHeaderNames;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TrustedHeaderFilterTest {

    private final TrustedHeaderFilter filter = new TrustedHeaderFilter();

    @Test
    void testFilterRemovesUntrustedHeadersWhenUnauthenticated() {
        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/employees")
                .header(TrustedHeaderNames.USER_ID, "999")
                .header(TrustedHeaderNames.USER_ROLE, "ADMIN")
                .header(TrustedHeaderNames.GATEWAY_AUTHENTICATED, "true")
                .build();

        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        when(chain.filter(argThat(ex -> {
            assertNull(ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.USER_ID));
            assertNull(ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.USER_ROLE));
            assertNull(ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.GATEWAY_AUTHENTICATED));
            return true;
        }))).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain))
                .verifyComplete();
    }

    @Test
    void testFilterAddsTrustedHeadersWhenAuthenticated() {
        GatewayAuthenticatedUser user = GatewayAuthenticatedUser.builder()
                .userId(1L)
                .employeeId(10L)
                .email("admin@company.com")
                .role("ADMIN")
                .build();

        Authentication auth = new UsernamePasswordAuthenticationToken(
                user,
                "token",
                List.of(new SimpleGrantedAuthority("ROLE_ADMIN"))
        );
        SecurityContext context = new SecurityContextImpl(auth);

        MockServerHttpRequest request = MockServerHttpRequest.get("/api/v1/employees").build();
        MockServerWebExchange exchange = MockServerWebExchange.from(request);
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        when(chain.filter(argThat(ex -> {
            assertEquals("1", ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.USER_ID));
            assertEquals("10", ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.EMPLOYEE_ID));
            assertEquals("admin@company.com", ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.USER_EMAIL));
            assertEquals("ADMIN", ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.USER_ROLE));
            assertEquals("true", ex.getRequest().getHeaders().getFirst(TrustedHeaderNames.GATEWAY_AUTHENTICATED));
            return true;
        }))).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)
                        .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(context))))
                .verifyComplete();
    }
}
