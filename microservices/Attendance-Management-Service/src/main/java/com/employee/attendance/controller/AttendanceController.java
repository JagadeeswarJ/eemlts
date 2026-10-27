package com.employee.attendance.controller;

import com.employee.attendance.dto.request.AttendanceCorrectionDecisionDto;
import com.employee.attendance.dto.request.AttendanceCorrectionRequestDto;
import com.employee.attendance.dto.response.*;
import com.employee.attendance.security.RequestUser;
import com.employee.attendance.service.AttendanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class AttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/check-in")
    public Mono<ResponseEntity<ApiResponse<AttendanceRecordResponseDto>>> checkIn(
            @AuthenticationPrincipal RequestUser user
    ) {
        return attendanceService.checkIn(user)
                .map(record -> ResponseEntity.ok(ApiResponse.ok("Checked in successfully", record)));
    }

    @PostMapping("/check-out")
    public Mono<ResponseEntity<ApiResponse<AttendanceRecordResponseDto>>> checkOut(
            @AuthenticationPrincipal RequestUser user
    ) {
        return attendanceService.checkOut(user)
                .map(record -> ResponseEntity.ok(ApiResponse.ok("Checked out successfully", record)));
    }

    @GetMapping("/today")
    public Mono<ResponseEntity<ApiResponse<AttendanceRecordResponseDto>>> getTodayAttendance(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId
    ) {
        return attendanceService.getTodayAttendance(user, employeeId)
                .map(record -> ResponseEntity.ok(ApiResponse.ok(record)));
    }

    @GetMapping("/history")
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<AttendanceRecordResponseDto>>>> getAttendanceHistory(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return attendanceService.getAttendanceHistory(user, employeeId, startDate, endDate, status, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @GetMapping("/daily")
    public Mono<ResponseEntity<ApiResponse<DailyAttendanceSummaryDto>>> getDailyAttendance(
            @RequestParam(value = "date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(value = "departmentId", required = false) Long departmentId
    ) {
        return attendanceService.getDailyAttendance(date, departmentId)
                .map(summary -> ResponseEntity.ok(ApiResponse.ok(summary)));
    }

    @GetMapping("/monthly")
    public Mono<ResponseEntity<ApiResponse<List<AttendanceRecordResponseDto>>>> getMonthlyAttendance(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "year", defaultValue = "2026") int year,
            @RequestParam(value = "month", defaultValue = "10") int month
    ) {
        return attendanceService.getMonthlyAttendance(user, employeeId, year, month)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/stats")
    public Mono<ResponseEntity<ApiResponse<AttendanceStatsResponseDto>>> getAttendanceStats(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "year", defaultValue = "2026") int year,
            @RequestParam(value = "month", defaultValue = "10") int month
    ) {
        return attendanceService.getAttendanceStats(user, employeeId, year, month)
                .map(stats -> ResponseEntity.ok(ApiResponse.ok(stats)));
    }

    @PostMapping("/corrections")
    public Mono<ResponseEntity<ApiResponse<AttendanceAuditLogResponseDto>>> requestCorrection(
            @AuthenticationPrincipal RequestUser user,
            @Valid @RequestBody AttendanceCorrectionRequestDto request
    ) {
        return attendanceService.requestCorrection(user, request)
                .map(logDto -> ResponseEntity.ok(ApiResponse.ok("Attendance correction requested successfully", logDto)));
    }

    @PutMapping("/corrections/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Mono<ResponseEntity<ApiResponse<AttendanceAuditLogResponseDto>>> processCorrection(
            @PathVariable("id") Long auditId,
            @Valid @RequestBody AttendanceCorrectionDecisionDto decision,
            @AuthenticationPrincipal RequestUser approver
    ) {
        return attendanceService.processCorrection(auditId, decision, approver)
                .map(logDto -> ResponseEntity.ok(ApiResponse.ok("Correction request processed successfully", logDto)));
    }

    @GetMapping("/audit-logs")
    public Mono<ResponseEntity<ApiResponse<List<AttendanceAuditLogResponseDto>>>> getAuditLogs(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId
    ) {
        return attendanceService.getAuditLogs(user, employeeId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }
}
