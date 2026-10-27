package com.employee.attendance.service;

import com.employee.attendance.dto.request.AttendanceCorrectionDecisionDto;
import com.employee.attendance.dto.request.AttendanceCorrectionRequestDto;
import com.employee.attendance.dto.response.AttendanceRecordResponseDto;
import com.employee.attendance.dto.response.AttendanceStatsResponseDto;
import com.employee.attendance.entity.AttendanceAuditLog;
import com.employee.attendance.entity.AttendanceRecord;
import com.employee.attendance.entity.Employee;
import com.employee.attendance.enums.AttendanceStatus;
import com.employee.attendance.enums.AuditAction;
import com.employee.attendance.enums.Role;
import com.employee.attendance.exception.InvalidOperationException;
import com.employee.attendance.exception.UnauthorizedOperationException;
import com.employee.attendance.repository.AttendanceAuditLogRepository;
import com.employee.attendance.repository.AttendanceRecordRepository;
import com.employee.attendance.repository.EmployeeRepository;
import com.employee.attendance.security.RequestUser;
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
class AttendanceServiceTest {

    @Mock
    private AttendanceRecordRepository attendanceRecordRepository;

    @Mock
    private AttendanceAuditLogRepository auditLogRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private AttendanceService attendanceService;

    private RequestUser sampleUser;
    private Employee sampleEmployee;
    private AttendanceRecord sampleRecord;

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

        sampleRecord = AttendanceRecord.builder()
                .attendanceId(101L)
                .employeeId(4L)
                .attendanceDate(LocalDate.now())
                .checkInTime(LocalDateTime.now().minusHours(8))
                .checkOutTime(null)
                .totalHours(BigDecimal.ZERO)
                .status(AttendanceStatus.PRESENT)
                .createdAt(LocalDateTime.now().minusHours(8))
                .updatedAt(LocalDateTime.now().minusHours(8))
                .build();
    }

    @Test
    void testCheckInSuccess() {
        LocalDate today = LocalDate.now();

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(4L, today))
                .thenReturn(Mono.empty());
        when(attendanceRecordRepository.save(any(AttendanceRecord.class)))
                .thenAnswer(inv -> {
                    AttendanceRecord rec = inv.getArgument(0);
                    rec.setAttendanceId(101L);
                    return Mono.just(rec);
                });
        when(auditLogRepository.save(any(AttendanceAuditLog.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));

        StepVerifier.create(attendanceService.checkIn(sampleUser))
                .assertNext(res -> {
                    assertNotNull(res);
                    assertEquals(4L, res.getEmployeeId());
                    assertEquals(AttendanceStatus.PRESENT, res.getStatus());
                    assertNotNull(res.getCheckInTime());
                    assertTrue(res.isCanCheckOut());
                })
                .verifyComplete();
    }

    @Test
    void testCheckInDuplicateFails() {
        LocalDate today = LocalDate.now();

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(4L, today))
                .thenReturn(Mono.just(sampleRecord));

        StepVerifier.create(attendanceService.checkIn(sampleUser))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testCheckOutSuccess() {
        LocalDate today = LocalDate.now();

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(4L, today))
                .thenReturn(Mono.just(sampleRecord));
        when(attendanceRecordRepository.save(any(AttendanceRecord.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(auditLogRepository.save(any(AttendanceAuditLog.class)))
                .thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));

        StepVerifier.create(attendanceService.checkOut(sampleUser))
                .assertNext(res -> {
                    assertNotNull(res);
                    assertNotNull(res.getCheckOutTime());
                    assertTrue(res.getTotalHours().compareTo(BigDecimal.ZERO) > 0);
                    assertFalse(res.isCanCheckOut());
                })
                .verifyComplete();
    }

    @Test
    void testCheckOutWithoutCheckInFails() {
        LocalDate today = LocalDate.now();

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(4L, today))
                .thenReturn(Mono.empty());

        StepVerifier.create(attendanceService.checkOut(sampleUser))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testCheckOutAlreadyCheckedOutFails() {
        LocalDate today = LocalDate.now();
        sampleRecord.setCheckOutTime(LocalDateTime.now());

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(4L, today))
                .thenReturn(Mono.just(sampleRecord));

        StepVerifier.create(attendanceService.checkOut(sampleUser))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testGetAttendanceStats() {
        AttendanceRecord r1 = AttendanceRecord.builder()
                .employeeId(4L)
                .attendanceDate(LocalDate.of(2026, 10, 19))
                .totalHours(BigDecimal.valueOf(8.5))
                .status(AttendanceStatus.PRESENT)
                .build();
        AttendanceRecord r2 = AttendanceRecord.builder()
                .employeeId(4L)
                .attendanceDate(LocalDate.of(2026, 10, 20))
                .totalHours(BigDecimal.valueOf(4.0))
                .status(AttendanceStatus.HALF_DAY)
                .build();

        when(attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                eq(4L), any(LocalDate.class), any(LocalDate.class)
        )).thenReturn(Flux.just(r1, r2));

        StepVerifier.create(attendanceService.getAttendanceStats(sampleUser, 4L, 2026, 10))
                .assertNext(stats -> {
                    assertEquals(2, stats.getTotalDays());
                    assertEquals(1, stats.getPresentDays());
                    assertEquals(1, stats.getHalfDays());
                    assertEquals(BigDecimal.valueOf(12.5), stats.getTotalWorkingHours());
                })
                .verifyComplete();
    }

    @Test
    void testProcessCorrectionApproved() {
        AttendanceAuditLog logEntry = AttendanceAuditLog.builder()
                .auditId(501L)
                .attendanceId(101L)
                .employeeId(4L)
                .action(AuditAction.CORRECTION_REQUEST)
                .reason("Missed swipe")
                .build();

        AttendanceCorrectionDecisionDto decision = new AttendanceCorrectionDecisionDto(true, "Approved by manager");
        RequestUser approver = new RequestUser(3L, 3L, "manager@company.com", Role.MANAGER);

        when(auditLogRepository.findById(501L)).thenReturn(Mono.just(logEntry));
        when(employeeRepository.findById(4L)).thenReturn(Mono.just(sampleEmployee));
        when(auditLogRepository.save(any(AttendanceAuditLog.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));
        when(attendanceRecordRepository.findById(101L)).thenReturn(Mono.just(sampleRecord));
        when(attendanceRecordRepository.save(any(AttendanceRecord.class))).thenAnswer(inv -> Mono.just(inv.getArgument(0)));

        StepVerifier.create(attendanceService.processCorrection(501L, decision, approver))
                .assertNext(res -> {
                    assertEquals(AuditAction.CORRECTION_APPROVED, res.getAction());
                    assertTrue(res.getReason().contains("Decision note: Approved by manager"));
                })
                .verifyComplete();
    }

    @Test
    void testProcessCorrectionSelfApprovalRejected() {
        AttendanceAuditLog logEntry = AttendanceAuditLog.builder()
                .auditId(501L)
                .employeeId(4L)
                .action(AuditAction.CORRECTION_REQUEST)
                .build();

        RequestUser selfApprover = new RequestUser(4L, 4L, "alex.jones@company.com", Role.EMPLOYEE);
        when(auditLogRepository.findById(501L)).thenReturn(Mono.just(logEntry));

        StepVerifier.create(attendanceService.processCorrection(501L, new AttendanceCorrectionDecisionDto(true, "Self"), selfApprover))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testProcessCorrectionAlreadyProcessedRejected() {
        AttendanceAuditLog logEntry = AttendanceAuditLog.builder()
                .auditId(501L)
                .employeeId(4L)
                .action(AuditAction.CORRECTION_APPROVED) // Already approved
                .build();

        RequestUser hrApprover = new RequestUser(2L, 2L, "hr@company.com", Role.HR);
        when(auditLogRepository.findById(501L)).thenReturn(Mono.just(logEntry));

        StepVerifier.create(attendanceService.processCorrection(501L, new AttendanceCorrectionDecisionDto(true, "Approve again"), hrApprover))
                .expectError(InvalidOperationException.class)
                .verify();
    }

    @Test
    void testProcessCorrectionManagerNonReportRejected() {
        AttendanceAuditLog logEntry = AttendanceAuditLog.builder()
                .auditId(501L)
                .employeeId(99L)
                .action(AuditAction.CORRECTION_REQUEST)
                .build();

        Employee nonReport = Employee.builder().employeeId(99L).managerId(888L).build();
        RequestUser manager = new RequestUser(3L, 3L, "manager@company.com", Role.MANAGER);

        when(auditLogRepository.findById(501L)).thenReturn(Mono.just(logEntry));
        when(employeeRepository.findById(99L)).thenReturn(Mono.just(nonReport));

        StepVerifier.create(attendanceService.processCorrection(501L, new AttendanceCorrectionDecisionDto(true, "Approve non report"), manager))
                .expectError(UnauthorizedOperationException.class)
                .verify();
    }
}
