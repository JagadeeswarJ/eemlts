package com.employee.leave.controller;

import com.employee.leave.dto.request.*;
import com.employee.leave.dto.response.*;
import com.employee.leave.security.RequestUser;
import com.employee.leave.service.LeaveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/leaves")
@RequiredArgsConstructor
public class LeaveController {

    private final LeaveService leaveService;

    @GetMapping("/types")
    public Mono<ResponseEntity<ApiResponse<List<LeaveTypeResponseDto>>>> getLeaveTypes() {
        return leaveService.getLeaveTypes()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/admin/types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<LeaveTypeResponseDto>>>> getLeaveTypesAdmin(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return leaveService.getLeaveTypesAdmin(search, isActive, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @PostMapping("/admin/types")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<LeaveTypeResponseDto>>> createLeaveType(
            @Valid @RequestBody CreateLeaveTypeRequestDto request
    ) {
        return leaveService.createLeaveType(request)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.ok("Leave type created successfully", created)));
    }

    @PutMapping("/admin/types/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<LeaveTypeResponseDto>>> updateLeaveType(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateLeaveTypeRequestDto request
    ) {
        return leaveService.updateLeaveType(id, request)
                .map(updated -> ResponseEntity.ok(ApiResponse.ok("Leave type updated successfully", updated)));
    }

    @PatchMapping("/admin/types/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<LeaveTypeResponseDto>>> updateLeaveTypeStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody LeaveTypeStatusRequestDto request
    ) {
        return leaveService.updateLeaveTypeStatus(id, request.getIsActive())
                .map(updated -> ResponseEntity.ok(ApiResponse.ok(
                        Boolean.TRUE.equals(request.getIsActive())
                                ? "Leave type activated successfully"
                                : "Leave type deactivated successfully",
                        updated
                )));
    }

    @GetMapping("/admin/balances")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<AdminLeaveBalanceResponseDto>>>> getAdminBalances(
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "leaveTypeId", required = false) Long leaveTypeId,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return leaveService.getAdminBalances(employeeId, departmentId, year, leaveTypeId, search, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @PutMapping("/admin/balances/{employeeId}/{leaveTypeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<AdminLeaveBalanceResponseDto>>> adjustLeaveAllocation(
            @PathVariable("employeeId") Long employeeId,
            @PathVariable("leaveTypeId") Long leaveTypeId,
            @Valid @RequestBody AdjustLeaveBalanceRequestDto request,
            @AuthenticationPrincipal RequestUser adminUser
    ) {
        return leaveService.adjustLeaveAllocation(employeeId, leaveTypeId, request, adminUser)
                .map(updated -> ResponseEntity.ok(ApiResponse.ok("Employee leave quota adjusted successfully", updated)));
    }

    @GetMapping("/admin/balance-adjustments")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<List<LeaveBalanceAdjustmentResponseDto>>>> getBalanceAdjustments(
            @RequestParam(value = "employeeId", required = false) Long employeeId
    ) {
        return leaveService.getBalanceAdjustments(employeeId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/balances")
    public Mono<ResponseEntity<ApiResponse<List<LeaveBalanceResponseDto>>>> getLeaveBalances(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        return leaveService.getLeaveBalances(user, employeeId, year)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @PostMapping("/apply")
    public Mono<ResponseEntity<ApiResponse<LeaveRequestResponseDto>>> applyLeave(
            @AuthenticationPrincipal RequestUser user,
            @Valid @RequestBody ApplyLeaveRequestDto request
    ) {
        return leaveService.applyLeave(user, request)
                .map(leaveReq -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.ok("Leave application submitted successfully", leaveReq)));
    }

    @PutMapping("/{id}/cancel")
    public Mono<ResponseEntity<ApiResponse<LeaveRequestResponseDto>>> cancelLeave(
            @PathVariable("id") Long leaveRequestId,
            @AuthenticationPrincipal RequestUser user
    ) {
        return leaveService.cancelLeave(leaveRequestId, user)
                .map(leaveReq -> ResponseEntity.ok(ApiResponse.ok("Leave request cancelled successfully", leaveReq)));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Mono<ResponseEntity<ApiResponse<LeaveRequestResponseDto>>> approveLeave(
            @PathVariable("id") Long leaveRequestId,
            @RequestBody(required = false) LeaveDecisionRequestDto decision,
            @AuthenticationPrincipal RequestUser approver
    ) {
        return leaveService.approveLeave(leaveRequestId, decision, approver)
                .map(leaveReq -> ResponseEntity.ok(ApiResponse.ok("Leave request approved successfully", leaveReq)));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Mono<ResponseEntity<ApiResponse<LeaveRequestResponseDto>>> rejectLeave(
            @PathVariable("id") Long leaveRequestId,
            @Valid @RequestBody LeaveDecisionRequestDto decision,
            @AuthenticationPrincipal RequestUser approver
    ) {
        return leaveService.rejectLeave(leaveRequestId, decision, approver)
                .map(leaveReq -> ResponseEntity.ok(ApiResponse.ok("Leave request rejected", leaveReq)));
    }

    @GetMapping("/history")
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<LeaveRequestResponseDto>>>> getLeaveHistory(
            @AuthenticationPrincipal RequestUser user,
            @RequestParam(value = "employeeId", required = false) Long employeeId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "year", required = false) Integer year,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return leaveService.getLeaveHistory(user, employeeId, status, year, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR', 'MANAGER')")
    public Mono<ResponseEntity<ApiResponse<List<LeaveRequestResponseDto>>>> getPendingApprovals(
            @AuthenticationPrincipal RequestUser user
    ) {
        return leaveService.getPendingApprovals(user)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/calendar")
    public Mono<ResponseEntity<ApiResponse<List<TeamLeaveCalendarDto>>>> getTeamLeaveCalendar(
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "departmentId", required = false) Long departmentId
    ) {
        return leaveService.getTeamLeaveCalendar(startDate, endDate, departmentId)
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }
}
