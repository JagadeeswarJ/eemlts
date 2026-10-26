package com.employee.gateway.config;

import com.employee.gateway.security.GatewayJwtSecurityContextRepository;
import com.employee.gateway.security.ReactiveAccessDeniedHandler;
import com.employee.gateway.security.ReactiveAuthenticationEntryPoint;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final GatewayJwtSecurityContextRepository securityContextRepository;
    private final ReactiveAuthenticationEntryPoint authenticationEntryPoint;
    private final ReactiveAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .securityContextRepository(securityContextRepository)
                .exceptionHandling(exceptionHandlingSpec ->
                        exceptionHandlingSpec
                                .authenticationEntryPoint(authenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeExchange(exchanges ->
                        exchanges
                                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                                .pathMatchers(
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/forgot-password",
                                        "/actuator/**",
                                        "/fallback/**"
                                ).permitAll()
                                .anyExchange().authenticated()
                )
                .build();
    }
}
