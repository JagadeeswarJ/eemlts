package com.employee.management.service;

import com.employee.management.dto.request.CreateEmployeeRequestDto;
import com.employee.management.dto.request.UpdateEmployeeRequestDto;
import com.employee.management.dto.response.EmployeeResponseDto;
import com.employee.management.dto.response.PagedResponseDto;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.LeaveType;
import com.employee.management.entity.User;
import com.employee.management.enums.EmploymentStatus;
import com.employee.management.enums.Role;
import com.employee.management.enums.UserStatus;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.LeaveBalanceRepository;
import com.employee.management.repository.LeaveTypeRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.RequestUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private LeaveTypeRepository leaveTypeRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private EmployeeService employeeService;

    private Department sampleDepartment;
    private Employee sampleEmployee;
    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleDepartment = Department.builder()
                .departmentId(1L)
                .name("Engineering")
                .code("ENG")
                .build();

        sampleUser = User.builder()
                .userId(1L)
                .email("alex.jones@company.com")
                .role(Role.EMPLOYEE)
                .status(UserStatus.ACTIVE)
                .build();

        sampleEmployee = Employee.builder()
                .employeeId(4L)
                .userId(1L)
                .employeeCode("EMP004")
                .firstName("Alex")
                .lastName("Jones")
                .email("alex.jones@company.com")
                .phone("+1-555-0104")
                .departmentId(1L)
                .designation("Senior Software Engineer")
                .joiningDate(LocalDate.of(2023, 2, 10))
                .employmentStatus(EmploymentStatus.ACTIVE)
                .managerId(null)
                .address("Market Street")
                .emergencyContact("+1-555-9004")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testCreateEmployeeSuccess() {
        CreateEmployeeRequestDto dto = CreateEmployeeRequestDto.builder()
                .firstName("Alex")
                .lastName("Jones")
                .email("alex.jones@company.com")
                .phone("+1-555-0104")
                .departmentId(1L)
                .designation("Senior Software Engineer")
                .joiningDate(LocalDate.of(2023, 2, 10))
                .address("Market Street")
                .emergencyContact("+1-555-9004")
                .role(Role.EMPLOYEE)
                .build();

        RequestUser requester = new RequestUser(1L, 1L, "admin@company.com", Role.ADMIN);

        when(userRepository.existsByEmail("alex.jones@company.com")).thenReturn(Mono.just(false));
        when(departmentRepository.findById(1L)).thenReturn(Mono.just(sampleDepartment));
        when(employeeRepository.count()).thenReturn(Mono.just(3L));
        when(passwordEncoder.encode("Password123!")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(sampleUser));
        when(employeeRepository.save(any(Employee.class))).thenReturn(Mono.just(sampleEmployee));
        when(leaveTypeRepository.findAll()).thenReturn(Flux.empty());

        StepVerifier.create(employeeService.createEmployee(dto, requester))
                .assertNext(res -> {
                    assertNotNull(res);
                    assertEquals("Alex", res.getFirstName());
                    assertEquals("Engineering", res.getDepartmentName());
                })
                .verifyComplete();
    }

    @Test
    void testCreateEmployeeDuplicateEmail() {
        CreateEmployeeRequestDto dto = CreateEmployeeRequestDto.builder()
                .email("alex.jones@company.com")
                .build();

        when(userRepository.existsByEmail("alex.jones@company.com")).thenReturn(Mono.just(true));

        StepVerifier.create(employeeService.createEmployee(dto, null))
                .expectError(DuplicateResourceException.class)
                .verify();
    }

    @Test
    void testGetEmployeeByIdSuccess() {
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(departmentRepository.findById(1L)).thenReturn(Mono.just(sampleDepartment));
        when(userRepository.findById(1L)).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(employeeService.getEmployeeById(4L))
                .assertNext(res -> {
                    assertEquals("EMP004", res.getEmployeeCode());
                    assertEquals("Engineering", res.getDepartmentName());
                })
                .verifyComplete();
    }

    @Test
    void testGetEmployeeByIdNotFound() {
        when(employeeRepository.findById(999L)).thenReturn(Mono.empty());

        StepVerifier.create(employeeService.getEmployeeById(999L))
                .expectError(ResourceNotFoundException.class)
                .verify();
    }

    @Test
    void testDeactivateEmployee() {
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(Mono.just(sampleEmployee));
        when(userRepository.findById(1L)).thenReturn(Mono.just(sampleUser));
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(employeeService.deactivateEmployee(4L, null))
                .verifyComplete();
    }

    @Test
    void testUpdateSelfProfileSuccess() {
        RequestUser user = new RequestUser(1L, 4L, "alex.jones@company.com", Role.EMPLOYEE);
        com.employee.management.dto.request.UpdateSelfProfileRequestDto req =
                new com.employee.management.dto.request.UpdateSelfProfileRequestDto("+1-555-9999", "New Address St", "Contact Name");

        Employee updatedEmp = Employee.builder()
                .employeeId(4L)
                .userId(1L)
                .employeeCode("EMP004")
                .firstName("Alex")
                .lastName("Jones")
                .email("alex.jones@company.com")
                .phone("+1-555-9999")
                .departmentId(1L)
                .designation("Senior Software Engineer")
                .employmentStatus(EmploymentStatus.ACTIVE)
                .address("New Address St")
                .emergencyContact("Contact Name")
                .build();

        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(Mono.just(updatedEmp));
        when(departmentRepository.findById(1L)).thenReturn(Mono.just(sampleDepartment));
        when(userRepository.findById(1L)).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(employeeService.updateSelfProfile(user, req))
                .assertNext(res -> {
                    assertEquals("+1-555-9999", res.getPhone());
                    assertEquals("New Address St", res.getAddress());
                    assertEquals("Contact Name", res.getEmergencyContact());
                    // Protected fields untouched
                    assertEquals("EMP004", res.getEmployeeCode());
                    assertEquals("Senior Software Engineer", res.getDesignation());
                })
                .verifyComplete();
    }
}
