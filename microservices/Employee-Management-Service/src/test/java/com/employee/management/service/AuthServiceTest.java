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
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.NotificationLogRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.JwtUtil;
import com.employee.management.security.RequestUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    private User sampleUser;
    private Employee sampleEmployee;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .userId(1L)
                .email("admin@company.com")
                .passwordHash("$2a$10$encodedHash")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        sampleEmployee = Employee.builder()
                .employeeId(10L)
                .userId(1L)
                .employeeCode("EMP001")
                .firstName("John")
                .lastName("Admin")
                .email("admin@company.com")
                .departmentId(1L)
                .designation("Admin")
                .build();
    }

    @Test
    void testLoginSuccess() {
        LoginRequestDto request = new LoginRequestDto("admin@company.com", "Password123!");

        when(userRepository.findByEmail("admin@company.com")).thenReturn(Mono.just(sampleUser));
        when(passwordEncoder.matches("Password123!", sampleUser.getPasswordHash())).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(sampleUser));
        when(employeeRepository.findByUserId(1L)).thenReturn(Mono.just(sampleEmployee));
        when(jwtUtil.generateToken(eq(1L), eq(10L), eq("admin@company.com"), eq(Role.ADMIN), any()))
                .thenReturn("mocked.jwt.token");
        when(jwtUtil.getExpiration()).thenReturn(7200000L);

        StepVerifier.create(authService.login(request))
                .assertNext(response -> {
                    assertNotNull(response);
                    assertEquals("mocked.jwt.token", response.getAccessToken());
                    assertEquals("admin@company.com", response.getEmail());
                    assertEquals(Role.ADMIN, response.getRole());
                })
                .verifyComplete();
    }

    @Test
    void testLoginInvalidPassword() {
        LoginRequestDto request = new LoginRequestDto("admin@company.com", "WrongPassword");

        when(userRepository.findByEmail("admin@company.com")).thenReturn(Mono.just(sampleUser));
        when(passwordEncoder.matches("WrongPassword", sampleUser.getPasswordHash())).thenReturn(false);

        StepVerifier.create(authService.login(request))
                .expectError(InvalidCredentialsException.class)
                .verify();
    }

    @Test
    void testLoginInactiveUser() {
        sampleUser.setStatus(UserStatus.INACTIVE);
        LoginRequestDto request = new LoginRequestDto("admin@company.com", "Password123!");

        when(userRepository.findByEmail("admin@company.com")).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(authService.login(request))
                .expectError(InvalidCredentialsException.class)
                .verify();
    }

    @Test
    void testGetCurrentUser() {
        RequestUser requestUser = RequestUser.builder()
                .userId(1L)
                .employeeId(10L)
                .email("admin@company.com")
                .role(Role.ADMIN)
                .build();

        Department dept = Department.builder()
                .departmentId(1L)
                .name("Engineering")
                .build();

        when(userRepository.findById(1L)).thenReturn(Mono.just(sampleUser));
        when(employeeRepository.findByUserId(1L)).thenReturn(Mono.just(sampleEmployee));
        when(departmentRepository.findById(1L)).thenReturn(Mono.just(dept));

        StepVerifier.create(authService.getCurrentUser(requestUser))
                .assertNext(response -> {
                    assertNotNull(response);
                    assertEquals(1L, response.getUserId());
                    assertEquals(10L, response.getEmployeeId());
                    assertEquals("Engineering", response.getDepartmentName());
                })
                .verifyComplete();
    }

    @Test
    void testChangePasswordMismatch() {
        ChangePasswordRequestDto dto = new ChangePasswordRequestDto("Password123!", "NewPass1!", "DifferentPass1!");

        StepVerifier.create(authService.changePassword(1L, dto))
                .expectError(RequestValidationException.class)
                .verify();
    }

    @Test
    void testForgotPassword() {
        ForgotPasswordRequestDto dto = new ForgotPasswordRequestDto("admin@company.com");
        when(userRepository.findByEmail("admin@company.com")).thenReturn(Mono.just(sampleUser));
        when(notificationLogRepository.save(any(NotificationLog.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));

        StepVerifier.create(authService.forgotPassword(dto))
                .assertNext(msg -> assertTrue(msg.contains("instructions have been forwarded")))
                .verifyComplete();
    }
}
