package com.employee.attendance.service;

import com.employee.attendance.dto.request.AttendanceCorrectionDecisionDto;
import com.employee.attendance.dto.request.AttendanceCorrectionRequestDto;
import com.employee.attendance.dto.response.*;
import com.employee.attendance.entity.AttendanceAuditLog;
import com.employee.attendance.entity.AttendanceRecord;
import com.employee.attendance.entity.Employee;
import com.employee.attendance.enums.AttendanceStatus;
import com.employee.attendance.enums.AuditAction;
import com.employee.attendance.enums.Role;
import com.employee.attendance.exception.InvalidOperationException;
import com.employee.attendance.exception.RequestValidationException;
import com.employee.attendance.exception.ResourceNotFoundException;
import com.employee.attendance.repository.AttendanceAuditLogRepository;
import com.employee.attendance.repository.AttendanceRecordRepository;
import com.employee.attendance.repository.EmployeeRepository;
import com.employee.attendance.security.RequestUser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AttendanceService {

    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceAuditLogRepository auditLogRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional
    public Mono<AttendanceRecordResponseDto> checkIn(RequestUser user) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            return Mono.error(new InvalidOperationException("No employee profile associated with current account"));
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .flatMap(existing -> Mono.<AttendanceRecord>error(new InvalidOperationException("Already checked in for today (" + today + "). Duplicate check-in is not allowed.")))
                .switchIfEmpty(Mono.defer(() -> {
                    AttendanceRecord record = AttendanceRecord.builder()
                            .employeeId(employeeId)
                            .attendanceDate(today)
                            .checkInTime(now)
                            .checkOutTime(null)
                            .totalHours(BigDecimal.ZERO)
                            .status(AttendanceStatus.PRESENT)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();

                    return attendanceRecordRepository.save(record)
                            .flatMap(savedRecord -> {
                                AttendanceAuditLog auditLog = AttendanceAuditLog.builder()
                                        .attendanceId(savedRecord.getAttendanceId())
                                        .employeeId(employeeId)
                                        .action(AuditAction.CHECK_IN)
                                        .previousStatus(null)
                                        .newStatus(AttendanceStatus.PRESENT.name())
                                        .reason("Daily check-in via employee portal")
                                        .performedBy(user.getEmail())
                                        .createdAt(now)
                                        .build();

                                return auditLogRepository.save(auditLog).thenReturn(savedRecord);
                            });
                }))
                .flatMap(this::enrichAndMapToResponseDto);
    }

    @Transactional
    public Mono<AttendanceRecordResponseDto> checkOut(RequestUser user) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            return Mono.error(new InvalidOperationException("No employee profile associated with current account"));
        }

        LocalDate today = LocalDate.now();
        LocalDateTime now = LocalDateTime.now();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .switchIfEmpty(Mono.error(new InvalidOperationException("Cannot check out. No check-in record found for today (" + today + ").")))
                .flatMap(record -> {
                    if (record.getCheckOutTime() != null) {
                        return Mono.error(new InvalidOperationException("Already checked out for today. Multiple check-outs are not permitted."));
                    }

                    if (now.isBefore(record.getCheckInTime())) {
                        return Mono.error(new InvalidOperationException("Invalid check-out time. Check-out cannot be prior to check-in time."));
                    }

                    long minutes = Duration.between(record.getCheckInTime(), now).toMinutes();
                    BigDecimal hours = BigDecimal.valueOf(minutes)
                            .divide(BigDecimal.valueOf(60), 2, RoundingMode.HALF_UP);

                    AttendanceStatus newStatus = hours.compareTo(BigDecimal.valueOf(4.0)) < 0
                            ? AttendanceStatus.HALF_DAY
                            : AttendanceStatus.PRESENT;

                    AttendanceStatus previousStatus = record.getStatus();

                    record.setCheckOutTime(now);
                    record.setTotalHours(hours);
                    record.setStatus(newStatus);
                    record.setUpdatedAt(now);

                    return attendanceRecordRepository.save(record)
                            .flatMap(savedRecord -> {
                                AttendanceAuditLog auditLog = AttendanceAuditLog.builder()
                                        .attendanceId(savedRecord.getAttendanceId())
                                        .employeeId(employeeId)
                                        .action(AuditAction.CHECK_OUT)
                                        .previousStatus(previousStatus.name())
                                        .newStatus(newStatus.name())
                                        .reason("Daily check-out via employee portal (Duration: " + hours + " hrs)")
                                        .performedBy(user.getEmail())
                                        .createdAt(now)
                                        .build();

                                return auditLogRepository.save(auditLog).thenReturn(savedRecord);
                            });
                })
                .flatMap(this::enrichAndMapToResponseDto);
    }

    public Mono<AttendanceRecordResponseDto> getTodayAttendance(RequestUser user, Long targetEmployeeId) {
        Long employeeId = (targetEmployeeId != null && (user.getRole() == Role.ADMIN || user.getRole() == Role.HR || user.getRole() == Role.MANAGER))
                ? targetEmployeeId
                : user.getEmployeeId();

        if (employeeId == null) {
            return Mono.error(new InvalidOperationException("No employee ID specified"));
        }

        LocalDate today = LocalDate.now();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, today)
                .flatMap(this::enrichAndMapToResponseDto)
                .switchIfEmpty(Mono.defer(() ->
                        employeeRepository.findById(employeeId)
                                .map(emp -> AttendanceRecordResponseDto.builder()
                                        .attendanceId(null)
                                        .employeeId(employeeId)
                                        .employeeCode(emp.getEmployeeCode())
                                        .employeeName(emp.getFirstName() + " " + emp.getLastName())
                                        .attendanceDate(today)
                                        .checkInTime(null)
                                        .checkOutTime(null)
                                        .totalHours(BigDecimal.ZERO)
                                        .status(null)
                                        .canCheckIn(true)
                                        .canCheckOut(false)
                                        .build()
                                )
                                .defaultIfEmpty(AttendanceRecordResponseDto.builder()
                                        .attendanceDate(today)
                                        .canCheckIn(true)
                                        .canCheckOut(false)
                                        .build()
                                )
                ));
    }

    public Mono<PagedResponseDto<AttendanceRecordResponseDto>> getAttendanceHistory(
            RequestUser user,
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            int page,
            int size
    ) {
        Long targetEmpId = (user.getRole() == Role.EMPLOYEE) ? user.getEmployeeId() : employeeId;

        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        long offset = (long) safePage * safeSize;

        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status))
                ? status.trim().toUpperCase() : null;

        return attendanceRecordRepository.countFiltered(targetEmpId, startDate, endDate, statusFilter)
                .flatMap(totalElements -> {
                    if (totalElements == 0) {
                        return Mono.just(PagedResponseDto.<AttendanceRecordResponseDto>builder()
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

                    return attendanceRecordRepository.findFiltered(targetEmpId, startDate, endDate, statusFilter, safeSize, offset)
                            .flatMap(this::enrichAndMapToResponseDto)
                            .collectList()
                            .map(list -> PagedResponseDto.<AttendanceRecordResponseDto>builder()
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

    public Mono<DailyAttendanceSummaryDto> getDailyAttendance(LocalDate date, Long departmentId) {
        LocalDate targetDate = date != null ? date : LocalDate.now();

        Flux<Employee> employeesFlux = departmentId != null
                ? employeeRepository.findByDepartmentId(departmentId)
                : employeeRepository.findAll();

        return employeesFlux.collectList()
                .flatMap(employees ->
                        attendanceRecordRepository.findByAttendanceDate(targetDate)
                                .collectList()
                                .flatMap(records -> {
                                    long totalEmployees = employees.size();
                                    long presentCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
                                    long halfDayCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.HALF_DAY).count();
                                    long onLeaveCount = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ON_LEAVE).count();
                                    long absentCount = Math.max(0, totalEmployees - (presentCount + halfDayCount + onLeaveCount));

                                    return Flux.fromIterable(records)
                                            .flatMap(this::enrichAndMapToResponseDto)
                                            .collectList()
                                            .map(responseList -> DailyAttendanceSummaryDto.builder()
                                                    .date(targetDate)
                                                    .totalEmployees(totalEmployees)
                                                    .presentCount(presentCount)
                                                    .halfDayCount(halfDayCount)
                                                    .onLeaveCount(onLeaveCount)
                                                    .absentCount(absentCount)
                                                    .records(responseList)
                                                    .build()
                                            );
                                })
                );
    }

    public Flux<AttendanceRecordResponseDto> getMonthlyAttendance(RequestUser user, Long employeeId, int year, int month) {
        Long targetEmpId = (user.getRole() == Role.EMPLOYEE) ? user.getEmployeeId() : employeeId;
        if (targetEmpId == null) {
            targetEmpId = user.getEmployeeId();
        }

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate start = yearMonth.atDay(1);
        LocalDate end = yearMonth.atEndOfMonth();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(targetEmpId, start, end)
                .flatMap(this::enrichAndMapToResponseDto);
    }

    public Mono<AttendanceStatsResponseDto> getAttendanceStats(RequestUser user, Long employeeId, int year, int month) {
        Long targetEmpId = (user.getRole() == Role.EMPLOYEE) ? user.getEmployeeId() : employeeId;
        if (targetEmpId == null) {
            targetEmpId = user.getEmployeeId();
        }

        YearMonth ym = YearMonth.of(year, month);
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(targetEmpId, start, end)
                .collectList()
                .map(records -> {
                    long totalDays = records.size();
                    long presentDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
                    long halfDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.HALF_DAY).count();
                    long onLeaveDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ON_LEAVE).count();
                    long absentDays = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

                    BigDecimal totalWorkingHours = records.stream()
                            .map(r -> r.getTotalHours() != null ? r.getTotalHours() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal avgHours = totalDays > 0
                            ? totalWorkingHours.divide(BigDecimal.valueOf(totalDays), 2, RoundingMode.HALF_UP)
                            : BigDecimal.ZERO;

                    double attendancePercentage = totalDays > 0
                            ? ((double) (presentDays + (halfDays * 0.5)) / totalDays) * 100.0
                            : 0.0;

                    return AttendanceStatsResponseDto.builder()
                            .totalDays(totalDays)
                            .presentDays(presentDays)
                            .halfDays(halfDays)
                            .onLeaveDays(onLeaveDays)
                            .absentDays(absentDays)
                            .totalWorkingHours(totalWorkingHours)
                            .averageWorkingHours(avgHours)
                            .attendancePercentage(Math.round(attendancePercentage * 10.0) / 10.0)
                            .build();
                });
    }

    @Transactional
    public Mono<AttendanceAuditLogResponseDto> requestCorrection(RequestUser user, AttendanceCorrectionRequestDto request) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            return Mono.error(new InvalidOperationException("No employee profile found"));
        }

        if (request.getProposedCheckOutTime() != null && request.getProposedCheckOutTime().isBefore(request.getProposedCheckInTime())) {
            return Mono.error(new RequestValidationException("Proposed check-out time cannot be earlier than proposed check-in time"));
        }

        LocalDateTime now = LocalDateTime.now();

        return attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(employeeId, request.getAttendanceDate())
                .flatMap(record -> {
                    String reasonDetails = request.getReason().trim() +
                            " | Proposed: [" + request.getProposedCheckInTime() + " to " +
                            (request.getProposedCheckOutTime() != null ? request.getProposedCheckOutTime() : "open") + "]";

                    AttendanceAuditLog auditLog = AttendanceAuditLog.builder()
                            .attendanceId(record.getAttendanceId())
                            .employeeId(employeeId)
                            .action(AuditAction.CORRECTION_REQUEST)
                            .previousStatus(record.getStatus() != null ? record.getStatus().name() : null)
                            .newStatus(AttendanceStatus.PRESENT.name())
                            .reason(reasonDetails)
                            .performedBy(user.getEmail())
                            .createdAt(now)
                            .build();

                    return auditLogRepository.save(auditLog)
                            .flatMap(this::mapAuditLogToDto);
                })
                .switchIfEmpty(Mono.defer(() -> {
                    String reasonDetails = request.getReason().trim() +
                            " | Proposed: [" + request.getProposedCheckInTime() + " to " +
                            (request.getProposedCheckOutTime() != null ? request.getProposedCheckOutTime() : "open") + "]";

                    AttendanceAuditLog auditLog = AttendanceAuditLog.builder()
                            .attendanceId(null)
                            .employeeId(employeeId)
                            .action(AuditAction.CORRECTION_REQUEST)
                            .previousStatus("ABSENT")
                            .newStatus(AttendanceStatus.PRESENT.name())
                            .reason(reasonDetails)
                            .performedBy(user.getEmail())
                            .createdAt(now)
                            .build();

                    return auditLogRepository.save(auditLog)
                            .flatMap(this::mapAuditLogToDto);
                }));
    }

    @Transactional
    public Mono<AttendanceAuditLogResponseDto> processCorrection(Long auditId, AttendanceCorrectionDecisionDto decision, RequestUser approver) {
        LocalDateTime now = LocalDateTime.now();

        return auditLogRepository.findById(auditId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Correction audit record not found with ID: " + auditId)))
                .flatMap(logEntry -> {
                    // Prevent self-approval
                    if (logEntry.getEmployeeId().equals(approver.getEmployeeId())) {
                        return Mono.error(new InvalidOperationException("Users cannot approve or reject their own attendance corrections"));
                    }

                    // Prevent processing already processed requests
                    if (logEntry.getAction() != AuditAction.CORRECTION_REQUEST) {
                        return Mono.error(new InvalidOperationException("Attendance correction request has already been processed with status: " + logEntry.getAction()));
                    }

                    // Check manager direct-report constraint
                    Mono<Void> authCheck = (approver.getRole() == Role.MANAGER)
                            ? employeeRepository.findById(logEntry.getEmployeeId())
                                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + logEntry.getEmployeeId())))
                                .flatMap(emp -> {
                                    if (emp.getManagerId() == null || !emp.getManagerId().equals(approver.getEmployeeId())) {
                                        return Mono.error(new com.employee.attendance.exception.UnauthorizedOperationException("Managers can review attendance corrections for direct reports only."));
                                    }
                                    return Mono.empty();
                                })
                            : Mono.empty();

                    AuditAction newAction = Boolean.TRUE.equals(decision.getApproved())
                            ? AuditAction.CORRECTION_APPROVED
                            : AuditAction.CORRECTION_REJECTED;

                    logEntry.setAction(newAction);
                    logEntry.setReason(logEntry.getReason() + " | Decision note: " + (decision.getComment() != null ? decision.getComment().trim() : "Processed"));
                    logEntry.setPerformedBy(approver.getEmail());

                    return authCheck
                            .then(Mono.defer(() -> auditLogRepository.save(logEntry)))
                            .<AttendanceAuditLog>flatMap(savedLog -> {
                                if (Boolean.TRUE.equals(decision.getApproved())) {
                                    return applyApprovedAttendanceCorrection(savedLog, now);
                                } else {
                                    return Mono.just(savedLog);
                                }
                            })
                            .flatMap(this::mapAuditLogToDto);
                });
    }

    private Mono<AttendanceAuditLog> applyApprovedAttendanceCorrection(AttendanceAuditLog savedLog, LocalDateTime now) {
        if (savedLog.getAttendanceId() != null) {
            return attendanceRecordRepository.findById(savedLog.getAttendanceId())
                    .flatMap(rec -> {
                        rec.setStatus(AttendanceStatus.PRESENT);
                        rec.setUpdatedAt(now);
                        return attendanceRecordRepository.save(rec);
                    })
                    .thenReturn(savedLog);
        } else {
            AttendanceRecord newRecord = AttendanceRecord.builder()
                    .employeeId(savedLog.getEmployeeId())
                    .attendanceDate(now.toLocalDate())
                    .checkInTime(now.withHour(9).withMinute(0).withSecond(0))
                    .checkOutTime(now.withHour(17).withMinute(30).withSecond(0))
                    .totalHours(BigDecimal.valueOf(8.5))
                    .status(AttendanceStatus.PRESENT)
                    .createdAt(now)
                    .updatedAt(now)
                    .build();
            return attendanceRecordRepository.save(newRecord)
                    .flatMap(rec -> {
                        savedLog.setAttendanceId(rec.getAttendanceId());
                        return auditLogRepository.save(savedLog);
                    });
        }
    }

    public Flux<AttendanceAuditLogResponseDto> getAuditLogs(RequestUser user, Long employeeId) {
        if (user.getRole() == Role.ADMIN || user.getRole() == Role.HR) {
            if (employeeId != null) {
                return auditLogRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId).flatMap(this::mapAuditLogToDto);
            }
            return auditLogRepository.findAllByOrderByCreatedAtDesc().flatMap(this::mapAuditLogToDto);
        }

        Long targetEmpId = (employeeId != null && user.getRole() == Role.MANAGER) ? employeeId : user.getEmployeeId();
        return auditLogRepository.findByEmployeeIdOrderByCreatedAtDesc(targetEmpId).flatMap(this::mapAuditLogToDto);
    }

    private Mono<AttendanceRecordResponseDto> enrichAndMapToResponseDto(AttendanceRecord record) {
        boolean canCheckIn = record.getCheckInTime() == null;
        boolean canCheckOut = record.getCheckInTime() != null && record.getCheckOutTime() == null;

        return employeeRepository.findById(record.getEmployeeId())
                .map(emp -> AttendanceRecordResponseDto.builder()
                        .attendanceId(record.getAttendanceId())
                        .employeeId(record.getEmployeeId())
                        .employeeCode(emp.getEmployeeCode())
                        .employeeName(emp.getFirstName() + " " + emp.getLastName())
                        .attendanceDate(record.getAttendanceDate())
                        .checkInTime(record.getCheckInTime())
                        .checkOutTime(record.getCheckOutTime())
                        .totalHours(record.getTotalHours())
                        .status(record.getStatus())
                        .canCheckIn(canCheckIn)
                        .canCheckOut(canCheckOut)
                        .createdAt(record.getCreatedAt())
                        .updatedAt(record.getUpdatedAt())
                        .build()
                )
                .defaultIfEmpty(AttendanceRecordResponseDto.builder()
                        .attendanceId(record.getAttendanceId())
                        .employeeId(record.getEmployeeId())
                        .employeeCode("EMP" + record.getEmployeeId())
                        .employeeName("Employee #" + record.getEmployeeId())
                        .attendanceDate(record.getAttendanceDate())
                        .checkInTime(record.getCheckInTime())
                        .checkOutTime(record.getCheckOutTime())
                        .totalHours(record.getTotalHours())
                        .status(record.getStatus())
                        .canCheckIn(canCheckIn)
                        .canCheckOut(canCheckOut)
                        .createdAt(record.getCreatedAt())
                        .updatedAt(record.getUpdatedAt())
                        .build()
                );
    }

    private Mono<AttendanceAuditLogResponseDto> mapAuditLogToDto(AttendanceAuditLog logEntry) {
        return employeeRepository.findById(logEntry.getEmployeeId())
                .map(emp -> AttendanceAuditLogResponseDto.builder()
                        .auditId(logEntry.getAuditId())
                        .attendanceId(logEntry.getAttendanceId())
                        .employeeId(logEntry.getEmployeeId())
                        .employeeName(emp.getFirstName() + " " + emp.getLastName())
                        .action(logEntry.getAction())
                        .previousStatus(logEntry.getPreviousStatus())
                        .newStatus(logEntry.getNewStatus())
                        .reason(logEntry.getReason())
                        .performedBy(logEntry.getPerformedBy())
                        .createdAt(logEntry.getCreatedAt())
                        .build()
                )
                .defaultIfEmpty(AttendanceAuditLogResponseDto.builder()
                        .auditId(logEntry.getAuditId())
                        .attendanceId(logEntry.getAttendanceId())
                        .employeeId(logEntry.getEmployeeId())
                        .employeeName("Employee #" + logEntry.getEmployeeId())
                        .action(logEntry.getAction())
                        .previousStatus(logEntry.getPreviousStatus())
                        .newStatus(logEntry.getNewStatus())
                        .reason(logEntry.getReason())
                        .performedBy(logEntry.getPerformedBy())
                        .createdAt(logEntry.getCreatedAt())
                        .build()
                );
    }
}
