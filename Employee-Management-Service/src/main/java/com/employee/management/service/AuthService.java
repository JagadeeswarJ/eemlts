package com.employee.management.service;

import com.employee.management.dto.request.ChangePasswordRequestDto;
import com.employee.management.dto.request.ForgotPasswordRequestDto;
import com.employee.management.dto.request.LoginRequestDto;
import com.employee.management.dto.response.CurrentUserResponseDto;
import com.employee.management.dto.response.JwtResponseDto;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.NotificationLog;
import com.employee.management.entity.User;
import com.employee.management.enums.Role;
import com.employee.management.enums.UserStatus;
import com.employee.management.exception.InvalidCredentialsException;
import com.employee.management.exception.RequestValidationException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.NotificationLogRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.JwtUtil;
import com.employee.management.security.RequestUser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public Mono<JwtResponseDto> login(LoginRequestDto request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        return userRepository.findByEmail(normalizedEmail)
                .switchIfEmpty(Mono.error(new InvalidCredentialsException("Invalid email or password")))
                .flatMap(user -> {
                    if (user.getStatus() != UserStatus.ACTIVE) {
                        return Mono.error(new InvalidCredentialsException("Your account is currently inactive. Please contact HR."));
                    }

                    return Mono.fromCallable(() -> passwordEncoder.matches(request.getPassword(), user.getPasswordHash()))
                            .subscribeOn(Schedulers.boundedElastic())
                            .flatMap(matches -> {
                                if (!matches) {
                                    return Mono.error(new InvalidCredentialsException("Invalid email or password"));
                                }

                                user.setLastLoginAt(LocalDateTime.now());
                                return userRepository.save(user);
                            });
                })
                .flatMap(user ->
                        employeeRepository.findByUserId(user.getUserId())
                                .map(employee -> buildJwtResponse(user, employee))
                                .switchIfEmpty(Mono.defer(() -> Mono.just(buildJwtResponse(user, null))))
                );
    }

    public Mono<CurrentUserResponseDto> getCurrentUser(RequestUser requestUser) {
        if (requestUser == null || requestUser.getUserId() == null) {
            return Mono.error(new InvalidCredentialsException("No authenticated user found"));
        }

        return userRepository.findById(requestUser.getUserId())
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User record not found")))
                .flatMap(user ->
                        employeeRepository.findByUserId(user.getUserId())
                                .flatMap(employee -> {
                                    if (employee.getDepartmentId() != null) {
                                        return departmentRepository.findById(employee.getDepartmentId())
                                                .map(Department::getName)
                                                .defaultIfEmpty("Unassigned")
                                                .map(deptName -> buildCurrentUserResponse(user, employee, deptName));
                                    }
                                    return Mono.just(buildCurrentUserResponse(user, employee, "Unassigned"));
                                })
                                .defaultIfEmpty(buildCurrentUserResponse(user, null, "Unassigned"))
                );
    }

    @Transactional
    public Mono<Void> changePassword(Long userId, ChangePasswordRequestDto request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return Mono.error(new RequestValidationException("New password and confirmation password do not match"));
        }

        return userRepository.findById(userId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("User not found")))
                .flatMap(user ->
                        Mono.fromCallable(() -> passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash()))
                                .subscribeOn(Schedulers.boundedElastic())
                                .flatMap(matches -> {
                                    if (!matches) {
                                        return Mono.error(new RequestValidationException("Current password does not match"));
                                    }

                                    return Mono.fromCallable(() -> passwordEncoder.encode(request.getNewPassword()))
                                            .subscribeOn(Schedulers.boundedElastic())
                                            .flatMap(newHash -> {
                                                user.setPasswordHash(newHash);
                                                user.setUpdatedAt(LocalDateTime.now());
                                                return userRepository.save(user).then();
                                            });
                                })
                );
    }

    public Mono<String> forgotPassword(ForgotPasswordRequestDto request) {
        String email = request.getEmail().trim().toLowerCase();

        return userRepository.findByEmail(email)
                .flatMap(user -> {
                    NotificationLog logEntry = NotificationLog.builder()
                            .recipientEmail(user.getEmail())
                            .recipientId(user.getUserId())
                            .subject("Password Reset Instructions")
                            .message("A password reset was requested. Since this is an internal enterprise environment, please contact system administration or use default credentials.")
                            .type("PASSWORD_RESET")
                            .status("SENT")
                            .createdAt(LocalDateTime.now())
                            .build();

                    return notificationLogRepository.save(logEntry)
                            .thenReturn("If the email address exists in our system, password reset instructions have been forwarded to the registered email.");
                })
                .defaultIfEmpty("If the email address exists in our system, password reset instructions have been forwarded to the registered email.");
    }

    private JwtResponseDto buildJwtResponse(User user, Employee employee) {
        Long employeeId = employee != null ? employee.getEmployeeId() : null;
        String fullName = employee != null ? employee.getFirstName() + " " + employee.getLastName() : user.getEmail();

        String token = jwtUtil.generateToken(
                user.getUserId(),
                employeeId,
                user.getEmail(),
                user.getRole(),
                fullName
        );

        return JwtResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(jwtUtil.getExpiration() / 1000)
                .userId(user.getUserId())
                .employeeId(employeeId)
                .email(user.getEmail())
                .role(user.getRole())
                .fullName(fullName)
                .build();
    }

    private CurrentUserResponseDto buildCurrentUserResponse(User user, Employee employee, String departmentName) {
        return CurrentUserResponseDto.builder()
                .userId(user.getUserId())
                .employeeId(employee != null ? employee.getEmployeeId() : null)
                .employeeCode(employee != null ? employee.getEmployeeCode() : "N/A")
                .email(user.getEmail())
                .role(user.getRole())
                .firstName(employee != null ? employee.getFirstName() : "")
                .lastName(employee != null ? employee.getLastName() : "")
                .fullName(employee != null ? employee.getFirstName() + " " + employee.getLastName() : user.getEmail())
                .departmentId(employee != null ? employee.getDepartmentId() : null)
                .departmentName(departmentName)
                .designation(employee != null ? employee.getDesignation() : user.getRole().name())
                .build();
    }
}
