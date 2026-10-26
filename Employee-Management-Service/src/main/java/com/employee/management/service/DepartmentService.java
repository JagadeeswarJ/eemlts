package com.employee.management.service;

import com.employee.management.dto.request.CreateDepartmentRequestDto;
import com.employee.management.dto.request.UpdateDepartmentRequestDto;
import com.employee.management.dto.response.DepartmentResponseDto;
import com.employee.management.dto.response.PagedResponseDto;
import com.employee.management.entity.Department;
import com.employee.management.exception.ConflictException;
import com.employee.management.exception.DuplicateResourceException;
import com.employee.management.exception.ResourceNotFoundException;
import com.employee.management.repository.DepartmentRepository;
import com.employee.management.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;

    public Flux<DepartmentResponseDto> getAllActiveDepartments() {
        return departmentRepository.findByIsActiveTrue()
                .flatMap(this::mapToDepartmentResponse);
    }

    public Flux<DepartmentResponseDto> getAllDepartments() {
        return departmentRepository.findByIsActiveTrue()
                .flatMap(this::mapToDepartmentResponse);
    }

    public Mono<DepartmentResponseDto> getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Department not found with ID: " + id)))
                .flatMap(this::mapToDepartmentResponse);
    }

    public Mono<PagedResponseDto<DepartmentResponseDto>> getDepartmentsAdmin(String search, Boolean isActive, int page, int size) {
        return departmentRepository.findAllByOrderByDepartmentIdAsc()
                .filter(dept -> {
                    if (isActive != null && !isActive.equals(dept.getIsActive())) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean matchName = dept.getName() != null && dept.getName().toLowerCase().contains(s);
                        boolean matchCode = dept.getCode() != null && dept.getCode().toLowerCase().contains(s);
                        return matchName || matchCode;
                    }
                    return true;
                })
                .flatMap(this::mapToDepartmentResponse)
                .collectList()
                .map(all -> {
                    int totalElements = all.size();
                    int totalPages = (int) Math.ceil((double) totalElements / size);
                    int fromIndex = Math.min(page * size, totalElements);
                    int toIndex = Math.min(fromIndex + size, totalElements);
                    var pagedList = all.subList(fromIndex, toIndex);

                    return PagedResponseDto.<DepartmentResponseDto>builder()
                            .content(pagedList)
                            .page(page)
                            .size(size)
                            .totalElements(totalElements)
                            .totalPages(totalPages)
                            .isFirst(page == 0)
                            .isLast(page >= totalPages - 1)
                            .build();
                });
    }

    @Transactional
    public Mono<DepartmentResponseDto> createDepartment(CreateDepartmentRequestDto request) {
        LocalDateTime now = LocalDateTime.now();

        return departmentRepository.findByCode(request.getCode().trim().toUpperCase())
                .flatMap(existing -> Mono.<Department>error(new DuplicateResourceException("Department code already exists: " + request.getCode())))
                .switchIfEmpty(Mono.defer(() -> departmentRepository.findByName(request.getName().trim())
                        .flatMap(existing -> Mono.<Department>error(new DuplicateResourceException("Department name already exists: " + request.getName())))
                ))
                .switchIfEmpty(Mono.defer(() -> {
                    Department dept = Department.builder()
                            .name(request.getName().trim())
                            .code(request.getCode().trim().toUpperCase())
                            .description(request.getDescription())
                            .managerId(request.getManagerId())
                            .isActive(true)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();
                    return departmentRepository.save(dept);
                }))
                .flatMap(this::mapToDepartmentResponse);
    }

    @Transactional
    public Mono<DepartmentResponseDto> updateDepartment(Long id, UpdateDepartmentRequestDto request) {
        LocalDateTime now = LocalDateTime.now();

        return departmentRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Department not found with ID: " + id)))
                .flatMap(dept -> departmentRepository.findByCode(request.getCode().trim().toUpperCase())
                        .filter(other -> !other.getDepartmentId().equals(id))
                        .flatMap(dup -> Mono.<Department>error(new DuplicateResourceException("Department code already taken: " + request.getCode())))
                        .switchIfEmpty(departmentRepository.findByName(request.getName().trim())
                                .filter(other -> !other.getDepartmentId().equals(id))
                                .flatMap(dup -> Mono.<Department>error(new DuplicateResourceException("Department name already taken: " + request.getName())))
                        )
                        .defaultIfEmpty(dept)
                        .flatMap(validatedDept -> {
                            validatedDept.setName(request.getName().trim());
                            validatedDept.setCode(request.getCode().trim().toUpperCase());
                            validatedDept.setDescription(request.getDescription());
                            validatedDept.setManagerId(request.getManagerId());
                            validatedDept.setUpdatedAt(now);
                            return departmentRepository.save(validatedDept);
                        })
                )
                .flatMap(this::mapToDepartmentResponse);
    }

    @Transactional
    public Mono<DepartmentResponseDto> updateDepartmentStatus(Long id, Boolean isActive) {
        LocalDateTime now = LocalDateTime.now();

        return departmentRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Department not found with ID: " + id)))
                .flatMap(dept -> {
                    if (Boolean.FALSE.equals(isActive)) {
                        return employeeRepository.findByDepartmentId(id)
                                .filter(e -> e.getEmploymentStatus() == com.employee.management.enums.EmploymentStatus.ACTIVE)
                                .count()
                                .flatMap(activeCount -> {
                                    if (activeCount > 0) {
                                        return Mono.error(new ConflictException(
                                                "Cannot deactivate department: " + activeCount + " active employee(s) are currently assigned. Please reassign active employees before deactivating."
                                        ));
                                    }
                                    dept.setIsActive(false);
                                    dept.setUpdatedAt(now);
                                    return departmentRepository.save(dept);
                                });
                    } else {
                        dept.setIsActive(true);
                        dept.setUpdatedAt(now);
                        return departmentRepository.save(dept);
                    }
                })
                .flatMap(this::mapToDepartmentResponse);
    }

    private Mono<DepartmentResponseDto> mapToDepartmentResponse(Department dept) {
        Mono<String> managerNameMono = dept.getManagerId() != null
                ? employeeRepository.findById(dept.getManagerId())
                    .map(m -> m.getFirstName() + " " + m.getLastName())
                    .defaultIfEmpty("Unassigned")
                : Mono.just("Unassigned");

        Mono<Long> empCountMono = employeeRepository.findByDepartmentId(dept.getDepartmentId()).count();

        return Mono.zip(managerNameMono, empCountMono)
                .map(tuple -> DepartmentResponseDto.builder()
                        .departmentId(dept.getDepartmentId())
                        .name(dept.getName())
                        .code(dept.getCode())
                        .description(dept.getDescription())
                        .managerId(dept.getManagerId())
                        .managerName(tuple.getT1())
                        .employeeCount(tuple.getT2())
                        .isActive(Boolean.TRUE.equals(dept.getIsActive()))
                        .createdAt(dept.getCreatedAt())
                        .updatedAt(dept.getUpdatedAt())
                        .build()
                );
    }
}
