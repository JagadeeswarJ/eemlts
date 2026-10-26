package com.employee.management.service;

import com.employee.management.dto.request.CreateEmployeeRequestDto;
import com.employee.management.dto.request.UpdateEmployeeRequestDto;
import com.employee.management.dto.response.EmployeeResponseDto;
import com.employee.management.dto.response.ManagerResponseDto;
import com.employee.management.dto.response.PagedResponseDto;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.LeaveBalance;
import com.employee.management.entity.LeaveType;
import com.employee.management.entity.User;
import com.employee.management.enums.EmploymentStatus;
import com.employee.management.enums.Role;
import com.employee.management.enums.UserStatus;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.exception.UnauthorizedOperationException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.LeaveBalanceRepository;
import com.employee.management.repository.LeaveTypeRepository;
import com.employee.management.repository.UserRepository;
import com.employee.management.security.RequestUser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private static final Logger log = LoggerFactory.getLogger(EmployeeService.class);

    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Mono<EmployeeResponseDto> createEmployee(CreateEmployeeRequestDto request, RequestUser requester) {
        String normalizedEmail = request.getEmail().trim().toLowerCase();

        return userRepository.existsByEmail(normalizedEmail)
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.error(new DuplicateResourceException("An account with email " + normalizedEmail + " already exists."));
                    }

                    return departmentRepository.findById(request.getDepartmentId())
                            .switchIfEmpty(Mono.error(new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId())))
                            .flatMap(dept -> generateEmployeeCode()
                                    .flatMap(code -> createNewUser(normalizedEmail, request.getRole())
                                            .flatMap(user -> createNewEmployee(request, user, code))
                                            .flatMap(savedEmployee -> initializeLeaveBalances(savedEmployee.getEmployeeId())
                                                    .thenReturn(savedEmployee)
                                            )
                                    )
                                    .flatMap(savedEmployee -> mapToResponseDto(savedEmployee, dept.getName()))
                            );
                });
    }

    @Transactional
    public Mono<EmployeeResponseDto> updateEmployee(Long employeeId, UpdateEmployeeRequestDto request, RequestUser requester) {
        return employeeRepository.findById(employeeId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + employeeId)))
                .flatMap(employee -> {
                    if (requester != null && requester.getRole() == Role.EMPLOYEE && !employee.getEmployeeId().equals(requester.getEmployeeId())) {
                        return Mono.error(new UnauthorizedOperationException("You can only modify your own contact details."));
                    }

                    employee.setFirstName(request.getFirstName().trim());
                    employee.setLastName(request.getLastName().trim());
                    employee.setPhone(request.getPhone().trim());
                    employee.setAddress(request.getAddress().trim());
                    employee.setEmergencyContact(request.getEmergencyContact().trim());

                    if (requester == null || requester.getRole() == Role.ADMIN || requester.getRole() == Role.HR) {
                        employee.setDepartmentId(request.getDepartmentId());
                        employee.setDesignation(request.getDesignation().trim());
                        employee.setManagerId(request.getManagerId());
                        if (request.getEmploymentStatus() != null) {
                            employee.setEmploymentStatus(request.getEmploymentStatus());
                        }
                    }

                    employee.setUpdatedAt(LocalDateTime.now());
                    return employeeRepository.save(employee);
                })
                .flatMap(this::enrichAndMapToResponseDto);
    }

    @Transactional
    public Mono<EmployeeResponseDto> updateSelfProfile(RequestUser user, com.employee.management.dto.request.UpdateSelfProfileRequestDto request) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            return Mono.error(new UnauthorizedOperationException("No employee profile associated with authenticated user"));
        }

        return employeeRepository.findById(employeeId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + employeeId)))
                .flatMap(emp -> {
                    emp.setPhone(request.getPhone().trim());
                    emp.setAddress(request.getAddress().trim());
                    emp.setEmergencyContact(request.getEmergencyContact().trim());
                    emp.setUpdatedAt(LocalDateTime.now());
                    return employeeRepository.save(emp);
                })
                .flatMap(this::enrichAndMapToResponseDto);
    }

    public Mono<EmployeeResponseDto> getEmployeeById(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + employeeId)))
                .flatMap(this::enrichAndMapToResponseDto);
    }

    public Mono<PagedResponseDto<EmployeeResponseDto>> getEmployees(
            Long departmentId,
            String status,
            String search,
            int page,
            int size
    ) {
        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        long offset = (long) safePage * safeSize;

        String searchPattern = (search != null && !search.isBlank()) ? search.trim() : null;
        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) ? status.trim().toUpperCase() : null;

        return employeeRepository.countFiltered(departmentId, statusFilter, searchPattern)
                .flatMap(totalElements -> {
                    if (totalElements == 0) {
                        return Mono.just(PagedResponseDto.<EmployeeResponseDto>builder()
                                .content(List.of())
                                .page(safePage)
                                .size(safeSize)
                                .totalElements(0)
                                .totalPages(0)
                                .isFirst(true)
                                .isLast(true)
                                .build());
                    }

                    int totalPages = (int) Math.ceil((double) totalElements / safeSize);

                    return employeeRepository.findFiltered(departmentId, statusFilter, searchPattern, safeSize, offset)
                            .flatMap(this::enrichAndMapToResponseDto)
                            .collectList()
                            .map(list -> PagedResponseDto.<EmployeeResponseDto>builder()
                                    .content(list)
                                    .page(safePage)
                                    .size(safeSize)
                                    .totalElements(totalElements)
                                    .totalPages(totalPages)
                                    .isFirst(safePage == 0)
                                    .isLast(safePage >= totalPages - 1)
                                    .build());
                });
    }

    @Transactional
    public Mono<Void> deactivateEmployee(Long employeeId, RequestUser requester) {
        return employeeRepository.findById(employeeId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + employeeId)))
                .flatMap(employee -> {
                    employee.setEmploymentStatus(EmploymentStatus.INACTIVE);
                    employee.setUpdatedAt(LocalDateTime.now());

                    return employeeRepository.save(employee)
                            .flatMap(savedEmp -> userRepository.findById(savedEmp.getUserId())
                                    .flatMap(user -> {
                                        user.setStatus(UserStatus.INACTIVE);
                                        user.setUpdatedAt(LocalDateTime.now());
                                        return userRepository.save(user);
                                    })
                            )
                            .then();
                });
    }

    public Flux<ManagerResponseDto> getManagers() {
        return employeeRepository.findAll()
                .filter(emp -> emp.getEmploymentStatus() == EmploymentStatus.ACTIVE)
                .flatMap(emp -> departmentRepository.findById(emp.getDepartmentId())
                        .map(Department::getName)
                        .defaultIfEmpty("Unassigned")
                        .map(deptName -> ManagerResponseDto.builder()
                                .employeeId(emp.getEmployeeId())
                                .employeeCode(emp.getEmployeeCode())
                                .fullName(emp.getFirstName() + " " + emp.getLastName())
                                .email(emp.getEmail())
                                .designation(emp.getDesignation())
                                .departmentName(deptName)
                                .build()
                        )
                );
    }

    private Mono<User> createNewUser(String email, Role role) {
        Role userRole = role != null ? role : Role.EMPLOYEE;
        return Mono.fromCallable(() -> passwordEncoder.encode("Password123!"))
                .subscribeOn(Schedulers.boundedElastic())
                .flatMap(encodedPassword -> {
                    User user = User.builder()
                            .email(email)
                            .passwordHash(encodedPassword)
                            .role(userRole)
                            .status(UserStatus.ACTIVE)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return userRepository.save(user);
                });
    }

    private Mono<Employee> createNewEmployee(CreateEmployeeRequestDto request, User user, String code) {
        Employee employee = Employee.builder()
                .userId(user.getUserId())
                .employeeCode(code)
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .email(request.getEmail().trim().toLowerCase())
                .phone(request.getPhone().trim())
                .departmentId(request.getDepartmentId())
                .designation(request.getDesignation().trim())
                .joiningDate(request.getJoiningDate())
                .employmentStatus(EmploymentStatus.ACTIVE)
                .managerId(request.getManagerId())
                .address(request.getAddress().trim())
                .emergencyContact(request.getEmergencyContact().trim())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return employeeRepository.save(employee);
    }

    private Mono<Void> initializeLeaveBalances(Long employeeId) {
        int currentYear = LocalDate.now().getYear();

        return leaveTypeRepository.findAll()
                .flatMap(type -> {
                    BigDecimal quota = BigDecimal.valueOf(type.getAnnualQuota());
                    LeaveBalance balance = LeaveBalance.builder()
                            .employeeId(employeeId)
                            .leaveTypeId(type.getLeaveTypeId())
                            .year(currentYear)
                            .totalDays(quota)
                            .usedDays(BigDecimal.ZERO)
                            .pendingDays(BigDecimal.ZERO)
                            .availableDays(quota)
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .build();

                    return leaveBalanceRepository.save(balance);
                })
                .then();
    }

    private Mono<String> generateEmployeeCode() {
        return employeeRepository.count()
                .map(count -> String.format("EMP%03d", count + 1));
    }

    private Mono<EmployeeResponseDto> enrichAndMapToResponseDto(Employee employee) {
        Mono<String> deptNameMono = (employee.getDepartmentId() != null && departmentRepository.findById(employee.getDepartmentId()) != null)
                ? departmentRepository.findById(employee.getDepartmentId()).map(Department::getName).defaultIfEmpty("Unassigned")
                : Mono.just("Unassigned");

        Mono<String> managerNameMono = (employee.getManagerId() != null && employeeRepository.findById(employee.getManagerId()) != null)
                ? employeeRepository.findById(employee.getManagerId()).map(m -> m.getFirstName() + " " + m.getLastName()).defaultIfEmpty("None")
                : Mono.just("None");

        Mono<Role> roleMono = (employee.getUserId() != null && userRepository.findById(employee.getUserId()) != null)
                ? userRepository.findById(employee.getUserId()).map(User::getRole).defaultIfEmpty(Role.EMPLOYEE)
                : Mono.just(Role.EMPLOYEE);

        return Mono.zip(deptNameMono, managerNameMono, roleMono)
                .map(tuple -> buildEmployeeResponse(employee, tuple.getT1(), tuple.getT2(), tuple.getT3()));
    }

    private Mono<EmployeeResponseDto> mapToResponseDto(Employee employee, String departmentName) {
        Mono<String> managerNameMono = (employee.getManagerId() != null && employeeRepository.findById(employee.getManagerId()) != null)
                ? employeeRepository.findById(employee.getManagerId()).map(m -> m.getFirstName() + " " + m.getLastName()).defaultIfEmpty("None")
                : Mono.just("None");

        Mono<Role> roleMono = (employee.getUserId() != null && userRepository.findById(employee.getUserId()) != null)
                ? userRepository.findById(employee.getUserId()).map(User::getRole).defaultIfEmpty(Role.EMPLOYEE)
                : Mono.just(Role.EMPLOYEE);

        return Mono.zip(managerNameMono, roleMono)
                .map(tuple -> buildEmployeeResponse(employee, departmentName, tuple.getT1(), tuple.getT2()));
    }

    private EmployeeResponseDto buildEmployeeResponse(Employee emp, String deptName, String managerName, Role role) {
        return EmployeeResponseDto.builder()
                .employeeId(emp.getEmployeeId())
                .userId(emp.getUserId())
                .employeeCode(emp.getEmployeeCode())
                .firstName(emp.getFirstName())
                .lastName(emp.getLastName())
                .fullName(emp.getFirstName() + " " + emp.getLastName())
                .email(emp.getEmail())
                .phone(emp.getPhone())
                .departmentId(emp.getDepartmentId())
                .departmentName(deptName)
                .designation(emp.getDesignation())
                .joiningDate(emp.getJoiningDate())
                .employmentStatus(emp.getEmploymentStatus())
                .managerId(emp.getManagerId())
                .managerName(managerName)
                .address(emp.getAddress())
                .emergencyContact(emp.getEmergencyContact())
                .role(role)
                .createdAt(emp.getCreatedAt())
                .updatedAt(emp.getUpdatedAt())
                .build();
    }
}
