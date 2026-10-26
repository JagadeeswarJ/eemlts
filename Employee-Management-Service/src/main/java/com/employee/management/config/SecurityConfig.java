package com.employee.management.config;

import com.employee.management.security.ReactiveAccessDeniedHandler;
import com.employee.management.security.ReactiveAuthenticationEntryPoint;
import com.employee.management.security.TrustedHeaderSecurityContextRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
@EnableReactiveMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final TrustedHeaderSecurityContextRepository securityContextRepository;
    private final ReactiveAuthenticationEntryPoint authenticationEntryPoint;
    private final ReactiveAccessDeniedHandler accessDeniedHandler;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable)
                .securityContextRepository(securityContextRepository)
                .exceptionHandling(spec ->
                        spec.authenticationEntryPoint(authenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler)
                )
                .authorizeExchange(exchanges ->
                        exchanges
                                .pathMatchers(HttpMethod.OPTIONS).permitAll()
                                .pathMatchers(
                                        "/api/v1/auth/login",
                                        "/api/v1/auth/forgot-password",
                                        "/actuator/**"
                                ).permitAll()
                                .anyExchange().authenticated()
                )
                .build();
    }
}
