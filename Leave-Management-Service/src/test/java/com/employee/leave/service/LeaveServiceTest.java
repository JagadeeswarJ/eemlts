package com.employee.leave.service;

import com.employee.leave.dto.request.AdjustLeaveBalanceRequestDto;
import com.employee.leave.dto.request.ApplyLeaveRequestDto;
import com.employee.leave.dto.request.CreateLeaveTypeRequestDto;
import com.employee.leave.dto.request.LeaveDecisionRequestDto;
import com.employee.leave.dto.response.LeaveRequestResponseDto;
import com.employee.leave.entity.*;
import com.employee.leave.enums.LeaveRequestStatus;
import com.employee.leave.enums.LeaveTypeCode;
import com.employee.leave.enums.Role;
import com.employee.leave.exception.InvalidOperationException;
import com.employee.leave.exception.UnauthorizedOperationException;
import com.employee.leave.repository.*;
import com.employee.leave.security.RequestUser;
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
class LeaveServiceTest {

    @Mock
    private LeaveTypeRepository leaveTypeRepository;

    @Mock
    private LeaveBalanceRepository leaveBalanceRepository;

    @Mock
    private LeaveRequestRepository leaveRequestRepository;

    @Mock
    private NotificationLogRepository notificationLogRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private LeaveBalanceAdjustmentRepository leaveBalanceAdjustmentRepository;

    @InjectMocks
    private LeaveService leaveService;

    private RequestUser sampleUser;
    private Employee sampleEmployee;
    private LeaveType sampleLeaveType;
    private LeaveBalance sampleBalance;
    private LeaveRequest sampleRequest;

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
                .managerId(3L)
                .departmentId(1L)
                .build();

        sampleLeaveType = LeaveType.builder()
                .leaveTypeId(1L)
                .code(LeaveTypeCode.CASUAL)
                .name("Casual Leave")
                .annualQuota(12)
                .isActive(true)
                .build();

        sampleBalance = LeaveBalance.builder()
                .balanceId(10L)
                .employeeId(4L)
                .leaveTypeId(1L)
                .year(2026)
                .totalDays(BigDecimal.valueOf(12))
                .usedDays(BigDecimal.valueOf(2))
                .pendingDays(BigDecimal.ZERO)
                .availableDays(BigDecimal.valueOf(10))
                .build();

        sampleRequest = LeaveRequest.builder()
                .leaveRequestId(1001L)
                .employeeId(4L)
                .leaveTypeId(1L)
                .startDate(LocalDate.of(2026, 11, 2))
                .endDate(LocalDate.of(2026, 11, 3))
                .totalDays(BigDecimal.valueOf(2))
                .reason("Personal work")
                .status(LeaveRequestStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testApplyLeaveSuccess() {
        ApplyLeaveRequestDto dto = ApplyLeaveRequestDto.builder()
                .leaveTypeId(1L)
                .startDate(LocalDate.of(2026, 11, 2))
                .endDate(LocalDate.of(2026, 11, 3))
                .reason("Personal work")
                .build();

        when(leaveTypeRepository.findById(1L)).thenReturn(Mono.just(sampleLeaveType));
        when(leaveRequestRepository.countOverlappingRequests(eq(4L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Mono.just(0L));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(4L, 1L, 2026))
                .thenReturn(Mono.just(sampleBalance));
        when(leaveBalanceRepository.save(any(LeaveBalance.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(leaveRequestRepository.save(any(LeaveRequest.class)))
                .thenReturn(Mono.just(sampleRequest));
        when(notificationLogRepository.save(any(NotificationLog.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));

        StepVerifier.create(leaveService.applyLeave(sampleUser, dto))
                .assertNext(res -> {
                    assertNotNull(res);
                    assertEquals(LeaveRequestStatus.PENDING, res.getStatus());
                    assertEquals(BigDecimal.valueOf(2), res.getTotalDays());
                })
                .verifyComplete();
    }

    @Test
    void testApplyLeaveOverlappingFails() {
        ApplyLeaveRequestDto dto = ApplyLeaveRequestDto.builder()
                .leaveTypeId(1L)
                .startDate(LocalDate.of(2026, 11, 2))
                .endDate(LocalDate.of(2026, 11, 3))
                .reason("Personal work")
                .build();

        when(leaveTypeRepository.findById(1L)).thenReturn(Mono.just(sampleLeaveType));
        when(leaveRequestRepository.countOverlappingRequests(eq(4L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Mono.just(1L));

        StepVerifier.create(leaveService.applyLeave(sampleUser, dto))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testApplyLeaveInsufficientBalanceFails() {
        ApplyLeaveRequestDto dto = ApplyLeaveRequestDto.builder()
                .leaveTypeId(1L)
                .startDate(LocalDate.of(2026, 11, 1))
                .endDate(LocalDate.of(2026, 11, 20))
                .reason("Long trip")
                .build();

        when(leaveTypeRepository.findById(1L)).thenReturn(Mono.just(sampleLeaveType));
        when(leaveRequestRepository.countOverlappingRequests(eq(4L), any(LocalDate.class), any(LocalDate.class)))
                .thenReturn(Mono.just(0L));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(4L, 1L, 2026))
                .thenReturn(Mono.just(sampleBalance));

        StepVerifier.create(leaveService.applyLeave(sampleUser, dto))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testApproveLeaveDeductsBalance() {
        sampleBalance.setPendingDays(BigDecimal.valueOf(2));
        sampleBalance.setAvailableDays(BigDecimal.valueOf(8));

        RequestUser approver = new RequestUser(3L, 3L, "manager@company.com", Role.MANAGER);
        LeaveDecisionRequestDto decision = new LeaveDecisionRequestDto("Approved by manager");

        Employee approverEmp = Employee.builder()
                .employeeId(3L)
                .firstName("David")
                .lastName("Miller")
                .build();

        when(leaveRequestRepository.findById(1001L)).thenReturn(Mono.just(sampleRequest));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(4L, 1L, 2026))
                .thenReturn(Mono.just(sampleBalance));
        when(leaveBalanceRepository.save(any(LeaveBalance.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(leaveRequestRepository.save(any(LeaveRequest.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(notificationLogRepository.save(any(NotificationLog.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(employeeRepository.findById(3L)).thenReturn(Mono.just(approverEmp));
        when(leaveTypeRepository.findById(1L)).thenReturn(Mono.just(sampleLeaveType));

        StepVerifier.create(leaveService.approveLeave(1001L, decision, approver))
                .assertNext(res -> {
                    assertEquals(LeaveRequestStatus.APPROVED, res.getStatus());
                    assertEquals("David Miller", res.getApproverName());
                    assertEquals("Approved by manager", res.getApproverComments());
                })
                .verifyComplete();
    }

    @Test
    void testSelfApprovalRejected() {
        RequestUser selfApprover = new RequestUser(4L, 4L, "alex.jones@company.com", Role.EMPLOYEE);
        when(leaveRequestRepository.findById(1001L)).thenReturn(Mono.just(sampleRequest));

        StepVerifier.create(leaveService.approveLeave(1001L, new LeaveDecisionRequestDto("Self approve"), selfApprover))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testRejectLeaveRequiresReason() {
        RequestUser approver = new RequestUser(3L, 3L, "manager@company.com", Role.MANAGER);
        StepVerifier.create(leaveService.rejectLeave(1001L, new LeaveDecisionRequestDto(""), approver))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testAdjustLeaveAllocationSuccess() {
        AdjustLeaveBalanceRequestDto req = new AdjustLeaveBalanceRequestDto(2026, BigDecimal.valueOf(15), "Quota adjustment by HR");
        RequestUser hrUser = new RequestUser(2L, 2L, "hr@company.com", Role.HR);

        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(4L, 1L, 2026))
                .thenReturn(Mono.just(sampleBalance));
        when(leaveBalanceRepository.save(any(LeaveBalance.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(leaveBalanceAdjustmentRepository.save(any(LeaveBalanceAdjustment.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(leaveTypeRepository.findById(1L)).thenReturn(Mono.just(sampleLeaveType));

        StepVerifier.create(leaveService.adjustLeaveAllocation(4L, 1L, req, hrUser))
                .assertNext(res -> {
                    assertEquals(BigDecimal.valueOf(15), res.getTotalDays());
                    assertEquals(BigDecimal.valueOf(13), res.getAvailableDays()); // 15 - 2 used
                })
                .verifyComplete();
    }

    @Test
    void testAdjustLeaveAllocationBelowUsedPlusPendingFails() {
        // Used is 2, pending is 0 -> attempting to set total to 1
        AdjustLeaveBalanceRequestDto req = new AdjustLeaveBalanceRequestDto(2026, BigDecimal.valueOf(1), "Too low");
        when(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(4L, 1L, 2026))
                .thenReturn(Mono.just(sampleBalance));

        StepVerifier.create(leaveService.adjustLeaveAllocation(4L, 1L, req, null))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testRoleScopedLeaveBalancesEmployeeForbiddenFromOther() {
        RequestUser empUser = new RequestUser(4L, 4L, "alex@company.com", Role.EMPLOYEE);
        // Attempting to view employee ID 5
        StepVerifier.create(leaveService.getLeaveBalances(empUser, 5L, 2026))
                .expectError(UnauthorizedOperationException.class)
                .verify();
    }

    @Test
    void testRoleScopedLeaveBalancesManagerForbiddenFromNonReport() {
        RequestUser mgrUser = new RequestUser(3L, 3L, "manager@company.com", Role.MANAGER);
        Employee nonReport = Employee.builder().employeeId(99L).managerId(888L).build();

        when(employeeRepository.findById(99L)).thenReturn(Mono.just(nonReport));

        StepVerifier.create(leaveService.getLeaveBalances(mgrUser, 99L, 2026))
                .expectError(UnauthorizedOperationException.class)
                .verify();
    }

    @Test
    void testCreateLeaveTypeSuccess() {
        CreateLeaveTypeRequestDto req = CreateLeaveTypeRequestDto.builder()
                .code(LeaveTypeCode.COMPENSATORY)
                .name("Compensatory Off")
                .description("Comp off")
                .annualQuota(5)
                .isCarryForward(false)
                .build();

        LeaveType saved = LeaveType.builder()
                .leaveTypeId(5L)
                .code(LeaveTypeCode.COMPENSATORY)
                .name("Compensatory Off")
                .description("Comp off")
                .annualQuota(5)
                .isActive(true)
                .build();

        when(leaveTypeRepository.findByCode(LeaveTypeCode.COMPENSATORY)).thenReturn(Mono.empty());
        when(leaveTypeRepository.save(any(LeaveType.class))).thenReturn(Mono.just(saved));

        StepVerifier.create(leaveService.createLeaveType(req))
                .assertNext(res -> {
                    assertEquals(LeaveTypeCode.COMPENSATORY, res.getCode());
                    assertEquals("Compensatory Off", res.getName());
                    assertTrue(res.getIsActive());
                })
                .verifyComplete();
    }
}
