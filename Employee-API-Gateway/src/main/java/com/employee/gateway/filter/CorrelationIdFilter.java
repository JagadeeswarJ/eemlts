package com.employee.gateway.filter;

import com.employee.gateway.security.TrustedHeaderNames;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Component
public class CorrelationIdFilter implements GlobalFilter, Ordered {

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String correlationId = exchange.getRequest().getHeaders().getFirst(TrustedHeaderNames.CORRELATION_ID);
        if (correlationId == null || correlationId.isBlank()) {
            correlationId = UUID.randomUUID().toString();
        }

        final String finalCorrelationId = correlationId;
        ServerHttpRequest request = exchange.getRequest().mutate()
                .header(TrustedHeaderNames.CORRELATION_ID, finalCorrelationId)
                .build();

        exchange.getResponse().getHeaders().set(TrustedHeaderNames.CORRELATION_ID, finalCorrelationId);

        return chain.filter(exchange.mutate().request(request).build());
    }
}
