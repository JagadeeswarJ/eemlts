package com.employee.management.controller;

import com.employee.management.dto.request.CreateDepartmentRequestDto;
import com.employee.management.dto.request.DepartmentStatusRequestDto;
import com.employee.management.dto.request.UpdateDepartmentRequestDto;
import com.employee.management.dto.response.ApiResponse;
import com.employee.management.dto.response.DepartmentResponseDto;
import com.employee.management.dto.response.PagedResponseDto;
import com.employee.management.service.DepartmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final DepartmentService departmentService;

    @GetMapping
    public Mono<ResponseEntity<ApiResponse<List<DepartmentResponseDto>>>> getAllActiveDepartments() {
        return departmentService.getAllActiveDepartments()
                .collectList()
                .map(list -> ResponseEntity.ok(ApiResponse.ok(list)));
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ApiResponse<DepartmentResponseDto>>> getDepartmentById(@PathVariable("id") Long id) {
        return departmentService.getDepartmentById(id)
                .map(dept -> ResponseEntity.ok(ApiResponse.ok(dept)));
    }

    @GetMapping("/admin")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<PagedResponseDto<DepartmentResponseDto>>>> getDepartmentsAdmin(
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "isActive", required = false) Boolean isActive,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        return departmentService.getDepartmentsAdmin(search, isActive, page, size)
                .map(paged -> ResponseEntity.ok(ApiResponse.ok(paged)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<DepartmentResponseDto>>> createDepartment(
            @Valid @RequestBody CreateDepartmentRequestDto request
    ) {
        return departmentService.createDepartment(request)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED)
                        .body(ApiResponse.ok("Department created successfully", created)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<DepartmentResponseDto>>> updateDepartment(
            @PathVariable("id") Long id,
            @Valid @RequestBody UpdateDepartmentRequestDto request
    ) {
        return departmentService.updateDepartment(id, request)
                .map(updated -> ResponseEntity.ok(ApiResponse.ok("Department updated successfully", updated)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR')")
    public Mono<ResponseEntity<ApiResponse<DepartmentResponseDto>>> updateDepartmentStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody DepartmentStatusRequestDto request
    ) {
        return departmentService.updateDepartmentStatus(id, request.getIsActive())
                .map(updated -> ResponseEntity.ok(ApiResponse.ok(
                        Boolean.TRUE.equals(request.getIsActive())
                                ? "Department activated successfully"
                                : "Department deactivated successfully",
                        updated
                )));
    }
}
