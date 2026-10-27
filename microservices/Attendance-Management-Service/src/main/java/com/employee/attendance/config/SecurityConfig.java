package com.employee.attendance.config;

import com.employee.attendance.security.ReactiveAccessDeniedHandler;
import com.employee.attendance.security.ReactiveAuthenticationEntryPoint;
import com.employee.attendance.security.TrustedHeaderSecurityContextRepository;
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
                                .pathMatchers("/actuator/**").permitAll()
                                .anyExchange().authenticated()
                )
                .build();
    }
}
