package com.employee.management.controller;

import com.employee.management.dto.request.ChangePasswordRequestDto;
import com.employee.management.dto.request.ForgotPasswordRequestDto;
import com.employee.management.dto.request.LoginRequestDto;
import com.employee.management.dto.response.ApiResponse;
import com.employee.management.dto.response.CurrentUserResponseDto;
import com.employee.management.dto.response.JwtResponseDto;
import com.employee.management.security.RequestUser;
import com.employee.management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final String COOKIE_NAME = "emp_access_token";

    private final AuthService authService;

    @PostMapping("/login")
    public Mono<ResponseEntity<ApiResponse<JwtResponseDto>>> login(
            @Valid @RequestBody LoginRequestDto request,
            ServerHttpResponse response
    ) {
        return authService.login(request)
                .map(jwtResponse -> {
                    ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, jwtResponse.getAccessToken())
                            .httpOnly(true)
                            .secure(false)
                            .path("/")
                            .maxAge(Duration.ofSeconds(jwtResponse.getExpiresIn()))
                            .sameSite("Lax")
                            .build();

                    response.addCookie(cookie);

                    return ResponseEntity.ok(ApiResponse.ok("Login successful", jwtResponse));
                });
    }

    @PostMapping("/logout")
    public Mono<ResponseEntity<ApiResponse<String>>> logout(ServerHttpResponse response) {
        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, "")
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(0)
                .sameSite("Lax")
                .build();

        response.addCookie(cookie);

        return Mono.just(ResponseEntity.ok(ApiResponse.ok("Logged out successfully", "Session ended")));
    }

    @GetMapping("/me")
    public Mono<ResponseEntity<ApiResponse<CurrentUserResponseDto>>> getCurrentUser(
            @AuthenticationPrincipal RequestUser user
    ) {
        return authService.getCurrentUser(user)
                .map(currentUser -> ResponseEntity.ok(ApiResponse.ok(currentUser)));
    }

    @PostMapping("/change-password")
    public Mono<ResponseEntity<ApiResponse<String>>> changePassword(
            @AuthenticationPrincipal RequestUser user,
            @Valid @RequestBody ChangePasswordRequestDto request
    ) {
        return authService.changePassword(user.getUserId(), request)
                .thenReturn(ResponseEntity.ok(ApiResponse.ok("Password changed successfully", "Updated")));
    }

    @PostMapping("/forgot-password")
    public Mono<ResponseEntity<ApiResponse<String>>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDto request
    ) {
        return authService.forgotPassword(request)
                .map(msg -> ResponseEntity.ok(ApiResponse.ok(msg, msg)));
    }
}
