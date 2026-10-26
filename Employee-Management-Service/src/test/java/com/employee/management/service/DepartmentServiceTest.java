package com.employee.management.service;

import com.employee.management.dto.request.CreateDepartmentRequestDto;
import com.employee.management.dto.request.UpdateDepartmentRequestDto;
import com.employee.management.dto.response.DepartmentResponseDto;
import com.employee.management.dto.response.PagedResponseDto;
import com.employee.management.entity.Department;
import com.employee.management.entity.Employee;
import com.employee.management.enums.EmploymentStatus;
import com.employee.management.exception.ConflictException;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private DepartmentService departmentService;

    @Test
    void testGetAllDepartments() {
        Department d1 = Department.builder()
                .departmentId(1L)
                .name("Engineering")
                .code("ENG")
                .managerId(3L)
                .isActive(true)
                .build();

        Employee manager = Employee.builder()
                .employeeId(3L)
                .firstName("David")
                .lastName("Miller")
                .build();

        when(departmentRepository.findByIsActiveTrue()).thenReturn(Flux.just(d1));
        when(employeeRepository.findById(3L)).thenReturn(Mono.just(manager));
        when(employeeRepository.findByDepartmentId(1L)).thenReturn(Flux.empty());

        StepVerifier.create(departmentService.getAllDepartments())
                .assertNext(res -> {
                    assertEquals("Engineering", res.getName());
                    assertEquals("ENG", res.getCode());
                    assertEquals("David Miller", res.getManagerName());
                    assertEquals(0L, res.getEmployeeCount());
                    assertTrue(res.getIsActive());
                })
                .verifyComplete();
    }

    @Test
    void testCreateDepartmentSuccess() {
        CreateDepartmentRequestDto req = CreateDepartmentRequestDto.builder()
                .name("Finance")
                .code("FIN")
                .description("Financial operations")
                .managerId(1L)
                .build();

        Department saved = Department.builder()
                .departmentId(10L)
                .name("Finance")
                .code("FIN")
                .description("Financial operations")
                .managerId(1L)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(departmentRepository.findByCode("FIN")).thenReturn(Mono.empty());
        when(departmentRepository.findByName("Finance")).thenReturn(Mono.empty());
        when(departmentRepository.save(any(Department.class))).thenReturn(Mono.just(saved));
        when(employeeRepository.findById(1L)).thenReturn(Mono.just(Employee.builder().firstName("John").lastName("Admin").build()));
        when(employeeRepository.findByDepartmentId(10L)).thenReturn(Flux.empty());

        StepVerifier.create(departmentService.createDepartment(req))
                .assertNext(res -> {
                    assertEquals("Finance", res.getName());
                    assertEquals("FIN", res.getCode());
                    assertEquals("John Admin", res.getManagerName());
                })
                .verifyComplete();
    }

    @Test
    void testCreateDepartmentDuplicateCode() {
        CreateDepartmentRequestDto req = CreateDepartmentRequestDto.builder()
                .name("Engineering Two")
                .code("ENG")
                .build();

        when(departmentRepository.findByCode("ENG")).thenReturn(Mono.just(Department.builder().departmentId(1L).build()));

        StepVerifier.create(departmentService.createDepartment(req))
                .expectError(DuplicateResourceException.class)
                .verify();
    }

    @Test
    void testDeactivateDepartmentWithActiveEmployeesThrowsConflict() {
        Department d1 = Department.builder()
                .departmentId(1L)
                .name("Engineering")
                .code("ENG")
                .isActive(true)
                .build();

        Employee activeEmp = Employee.builder()
                .employeeId(4L)
                .departmentId(1L)
                .employmentStatus(EmploymentStatus.ACTIVE)
                .build();

        when(departmentRepository.findById(1L)).thenReturn(Mono.just(d1));
        when(employeeRepository.findByDepartmentId(1L)).thenReturn(Flux.just(activeEmp));

        StepVerifier.create(departmentService.updateDepartmentStatus(1L, false))
                .expectError(ConflictException.class)
                .verify();
    }

    @Test
    void testDeactivateDepartmentWithoutActiveEmployeesSuccess() {
        Department d1 = Department.builder()
                .departmentId(2L)
                .name("Empty Dept")
                .code("EMP_DEPT")
                .isActive(true)
                .build();

        Department deactivated = Department.builder()
                .departmentId(2L)
                .name("Empty Dept")
                .code("EMP_DEPT")
                .isActive(false)
                .build();

        when(departmentRepository.findById(2L)).thenReturn(Mono.just(d1));
        when(employeeRepository.findByDepartmentId(2L)).thenReturn(Flux.empty());
        when(departmentRepository.save(any(Department.class))).thenReturn(Mono.just(deactivated));

        StepVerifier.create(departmentService.updateDepartmentStatus(2L, false))
                .assertNext(res -> {
                    assertEquals(false, res.getIsActive());
                })
                .verifyComplete();
    }

    @Test
    void testGetDepartmentsAdminWithSearchAndFilter() {
        Department d1 = Department.builder().departmentId(1L).name("Engineering").code("ENG").isActive(true).build();
        Department d2 = Department.builder().departmentId(2L).name("HR").code("HR").isActive(false).build();

        when(departmentRepository.findAllByOrderByDepartmentIdAsc()).thenReturn(Flux.just(d1, d2));
        when(employeeRepository.findByDepartmentId(1L)).thenReturn(Flux.empty());

        StepVerifier.create(departmentService.getDepartmentsAdmin("Eng", true, 0, 10))
                .assertNext(paged -> {
                    assertEquals(1, paged.getTotalElements());
                    assertEquals("Engineering", paged.getContent().get(0).getName());
                })
                .verifyComplete();
    }
}
