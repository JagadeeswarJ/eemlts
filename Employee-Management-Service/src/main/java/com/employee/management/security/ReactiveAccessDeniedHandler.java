package com.employee.management.security;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.server.authorization.ServerAccessDeniedHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
@RequiredArgsConstructor
public class ReactiveAccessDeniedHandler implements ServerAccessDeniedHandler {

    private final SecurityErrorResponseWriter errorResponseWriter;

    @Override
    public Mono<Void> handle(ServerWebExchange exchange, AccessDeniedException denied) {
        return errorResponseWriter.writeErrorResponse(
                exchange,
                HttpStatus.FORBIDDEN,
                "Access denied. You do not have permission to perform this action."
        );
    }
}
