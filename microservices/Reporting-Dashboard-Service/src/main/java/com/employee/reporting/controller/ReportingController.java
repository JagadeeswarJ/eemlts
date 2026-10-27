package com.employee.reporting.controller;

import com.employee.reporting.dto.response.*;
import com.employee.reporting.security.RequestUser;
import com.employee.reporting.service.ReportingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportingController {

    private final ReportingService reportingService;

    @GetMapping("/employee-dashboard")
    public Mono<ResponseEntity<ApiResponse<EmployeeDashboardDto>>> getEmployeeDashboard(
            @AuthenticationPrincipal RequestUser user
    ) {
        return reportingService.getEmployeeDashboard(user)
                .map(dashboard -> ResponseEntity.ok(ApiResponse.ok(dashboard)));
    }

    @GetMapping("/manager-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Mono<ResponseEntity<ApiResponse<ManagerDashboardDto>>> getManagerDashboard(
            @AuthenticationPrincipal RequestUser user
    ) {
        return reportingService.getManagerDashboard(user)
                .map(dashboard -> ResponseEntity.ok(ApiResponse.ok(dashboard)));
    }

    @GetMapping("/hr-dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<HrDashboardDto>>> getHrDashboard() {
        return reportingService.getHrDashboard()
                .map(dashboard -> ResponseEntity.ok(ApiResponse.ok(dashboard)));
    }

    @GetMapping("/department-reports")
    public Mono<ResponseEntity<ApiResponse<List<DepartmentReportDto>>>> getDepartmentReports() {
        return reportingService.getDepartmentReports()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/attendance-reports")
    public Mono<ResponseEntity<ApiResponse<List<AttendanceReportDto>>>> getAttendanceReports(
            @RequestParam(value = "year", defaultValue = "2026") int year
    ) {
        return reportingService.getAttendanceReports(year)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/leave-reports")
    public Mono<ResponseEntity<ApiResponse<List<LeaveReportDto>>>> getLeaveReports(
            @RequestParam(value = "year", defaultValue = "2026") int year
    ) {
        return reportingService.getLeaveReports(year)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }
}
