package com.employee.reporting.service;

import com.employee.reporting.dto.response.*;
import com.employee.reporting.entity.*;
import com.employee.reporting.enums.Role;
import com.employee.reporting.repository.*;
import com.employee.reporting.security.RequestUser;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportingServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private LeaveTypeRepository leaveTypeRepository;

    @InjectMocks
    private ReportingService reportingService;

    private RequestUser sampleUser;
    private Employee sampleEmployee;
    private Department sampleDepartment;

    @BeforeEach
    void setUp() {
        sampleUser = RequestUser.builder()
                .userId(4L)
                .employeeId(4L)
                .email("alex.jones@company.com")
                .role(Role.EMPLOYEE)
                .build();

        sampleEmployee = Employee.builder()
                .employeeId(4L)
                .employeeCode("EMP004")
                .firstName("Alex")
                .lastName("Jones")
                .email("alex.jones@company.com")
                .departmentId(1L)
                .designation("Senior Software Engineer")
                .joiningDate(LocalDate.of(2023, 2, 10))
                .build();

        sampleDepartment = Department.builder()
                .departmentId(1L)
                .name("Engineering")
                .code("ENG")
                .build();
    }

    @Test
    void testGetEmployeeDashboard() {
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(departmentRepository.findById(1L)).thenReturn(Mono.just(sampleDepartment));
        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(eq(4L), any(LocalDate.class)))
                .thenReturn(Mono.empty());
        when(leaveBalanceRepository.findByEmployeeIdAndYear(eq(4L), any(Integer.class)))
                .thenReturn(Flux.empty());
        when(leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(4L))
                .thenReturn(Flux.empty());
        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                eq(4L), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(Flux.empty());

        StepVerifier.create(reportingService.getEmployeeDashboard(sampleUser))
                .assertNext(res -> {
                    assertNotNull(res);
                    assertNotNull(res.getProfile());
                    assertEquals("Alex Jones", res.getProfile().getFullName());
                    assertEquals("Engineering", res.getProfile().getDepartmentName());
                    assertNotNull(res.getAttendanceSummary());
                    assertNotNull(res.getUpcomingHolidays());
                    assertFalse(res.getUpcomingHolidays().isEmpty());
                })
                .verifyComplete();
    }

    @Test
    void testGetHrDashboard() {
        when(employeeRepository.count()).thenReturn(Mono.just(6L));
        when(employeeRepository.countByEmploymentStatus("ACTIVE")).thenReturn(Mono.just(6L));
        when(employeeRepository.countByEmploymentStatus("INACTIVE")).thenReturn(Mono.just(0L));
        when(leaveRequestRepository.countByStatus("APPROVED")).thenReturn(Mono.just(3L));
        when(leaveRequestRepository.countByStatus("PENDING")).thenReturn(Mono.just(2L));
        when(leaveRequestRepository.countByStatus("REJECTED")).thenReturn(Mono.just(1L));
        when(departmentRepository.findAll()).thenReturn(Flux.just(sampleDepartment));
        when(employeeRepository.findByDepartmentId(1L)).thenReturn(Flux.just(sampleEmployee));
        when(leaveTypeRepository.findAll()).thenReturn(Flux.empty());

        StepVerifier.create(reportingService.getHrDashboard())
                .assertNext(res -> {
                    assertNotNull(res);
                    assertEquals(6L, res.getTotalEmployees());
                    assertEquals(6L, res.getActiveEmployees());
                    assertEquals(3L, res.getTotalApprovedLeaves());
                    assertNotNull(res.getDepartmentDistribution());
                })
                .verifyComplete();
    }

    @Test
    void testGetAttendanceReports() {
        StepVerifier.create(reportingService.getAttendanceReports(2026).collectList())
                .assertNext(list -> {
                    assertFalse(list.isEmpty());
                    assertEquals(10, list.size());
                    assertEquals("January", list.get(0).getMonth());
                })
                .verifyComplete();
    }
}
