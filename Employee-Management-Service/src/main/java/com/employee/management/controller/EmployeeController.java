package com.employee.management.controller;

import com.employee.management.dto.request.CreateEmployeeRequestDto;
import com.employee.management.dto.request.UpdateEmployeeRequestDto;
import com.employee.management.dto.request.UpdateSelfProfileRequestDto;
import com.employee.management.dto.response.*;
import com.employee.management.security.RequestUser;
import com.employee.management.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<EmployeeResponseDto>>> createEmployee(
            @Valid @RequestBody CreateEmployeeRequestDto request,
            @AuthenticationPrincipal RequestUser user
    ) {
        return employeeService.createEmployee(request, user)
                .map(employee -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.ok("Employee created successfully", employee)));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<EmployeeResponseDto>>> updateEmployee(
            @PathVariable("id") Long employeeId,
            @Valid @RequestBody UpdateEmployeeRequestDto request,
            @AuthenticationPrincipal RequestUser user
    ) {
        return employeeService.updateEmployee(employeeId, request, user)
                .map(employee -> ResponseEntity.ok(ApiResponse.ok("Employee updated successfully", employee)));
    }

    @PutMapping("/me/profile")
    public Mono<ResponseEntity<ApiResponse<EmployeeResponseDto>>> updateSelfProfile(
            @AuthenticationPrincipal RequestUser user,
            @Valid @RequestBody UpdateSelfProfileRequestDto request
    ) {
        return employeeService.updateSelfProfile(user, request)
                .map(employee -> ResponseEntity.ok(ApiResponse.ok("Personal profile contact details updated successfully", employee)));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<EmployeeResponseDto>>> getEmployeeById(
            @PathVariable("id") Long employeeId
    ) {
        return employeeService.getEmployeeById(employeeId)
                .map(employee -> ResponseEntity.ok(ApiResponse.ok(employee)));
    }

    @GetMapping("/{id}/profile")
    public Mono<ResponseEntity<ApiResponse<EmployeeResponseDto>>> getEmployeeProfile(
            @PathVariable("id") Long employeeId
    ) {
        return employeeService.getEmployeeById(employeeId)
                .map(employee -> ResponseEntity.ok(ApiResponse.ok(employee)));
    }

    @GetMapping
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<EmployeeResponseDto>>>> getEmployees(
            @RequestParam(value = "departmentId", required = false) Long departmentId,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return employeeService.getEmployees(departmentId, status, search, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<String>>> deactivateEmployee(
            @PathVariable("id") Long employeeId,
            @AuthenticationPrincipal RequestUser user
    ) {
        return employeeService.deactivateEmployee(employeeId, user)
                .thenReturn(ResponseEntity.ok(ApiResponse.ok("Employee deactivated successfully", "Inactive")));
    }

    @GetMapping("/managers")
    public Mono<ResponseEntity<ApiResponse<List<ManagerResponseDto>>>> getManagers() {
        return employeeService.getManagers()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }
}
