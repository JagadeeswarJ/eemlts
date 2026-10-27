package com.employee.management.config;

import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.entity.LeaveType;
import com.employee.management.entity.User;
import com.employee.management.enums.EmploymentStatus;
import com.employee.management.enums.Role;
import com.employee.management.enums.UserStatus;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import com.employee.management.repository.LeaveTypeRepository;
import com.employee.management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final LeaveTypeRepository leaveTypeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        String defaultPasswordHash = passwordEncoder.encode("Password123!");

        userRepository.count()
                .flatMap(count -> {
                    if (count == 0) {
                        log.info("No users found. Seeding initial administrative and employee accounts...");
                        return seedInitialData(defaultPasswordHash);
                    } else {
                        log.info("Found {} users in system. Ensuring password hash synchronization...", count);
                        return synchronizeDefaultUsers(defaultPasswordHash);
                    }
                })
                .subscribe(
                        null,
                        err -> log.warn("DataInitializer completed with notice: {}", err.getMessage()),
                        () -> log.info("DataInitializer completed successfully.")
                );
    }

    private Mono<Void> synchronizeDefaultUsers(String defaultPasswordHash) {
        return userRepository.findAll()
                .filter(u -> u.getEmail().endsWith("@company.com"))
                .flatMap(u -> {
                    u.setPasswordHash(defaultPasswordHash);
                    return userRepository.save(u);
                })
                .then();
    }

    private Mono<Void> seedInitialData(String defaultPasswordHash) {
        LocalDateTime now = LocalDateTime.now();

        Department engDept = Department.builder()
                .name("Engineering")
                .code("ENG")
                .description("Software and Cloud Engineering")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Department hrDept = Department.builder()
                .name("Human Resources")
                .code("HR")
                .description("Talent acquisition and people operations")
                .createdAt(now)
                .updatedAt(now)
                .build();

        return departmentRepository.save(engDept)
                .flatMap(savedEng -> departmentRepository.save(hrDept)
                        .flatMap(savedHr -> {
                            User adminUser = User.builder()
                                    .email("admin@company.com")
                                    .passwordHash(defaultPasswordHash)
                                    .role(Role.ADMIN)
                                    .status(UserStatus.ACTIVE)
                                    .createdAt(now)
                                    .updatedAt(now)
                                    .build();

                            return userRepository.save(adminUser)
                                    .flatMap(savedAdminUser -> {
                                        Employee adminEmp = Employee.builder()
                                                .userId(savedAdminUser.getUserId())
                                                .employeeCode("EMP001")
                                                .firstName("John")
                                                .lastName("Admin")
                                                .email("admin@company.com")
                                                .phone("+1-555-0101")
                                                .departmentId(savedHr.getDepartmentId())
                                                .designation("System Administrator")
                                                .joiningDate(LocalDate.of(2022, 1, 15))
                                                .employmentStatus(EmploymentStatus.ACTIVE)
                                                .address("100 Enterprise Way, New York, NY")
                                                .emergencyContact("+1-555-9001")
                                                .createdAt(now)
                                                .updatedAt(now)
                                                .build();

                                        return employeeRepository.save(adminEmp);
                                    });
                        })
                )
                .then();
    }
}
