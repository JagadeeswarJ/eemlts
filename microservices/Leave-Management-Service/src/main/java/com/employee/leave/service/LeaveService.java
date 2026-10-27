package com.employee.leave.service;

import com.employee.leave.dto.request.AdjustLeaveBalanceRequestDto;
import com.employee.leave.dto.request.ApplyLeaveRequestDto;
import com.employee.leave.dto.request.CreateLeaveTypeRequestDto;
import com.employee.leave.dto.request.LeaveDecisionRequestDto;
import com.employee.leave.dto.request.UpdateLeaveTypeRequestDto;
import com.employee.leave.dto.response.*;
import com.employee.leave.entity.*;
import com.employee.leave.enums.LeaveRequestStatus;
import com.employee.leave.enums.Role;
import com.employee.leave.exception.DuplicateResourceException;
import com.employee.leave.exception.InvalidOperationException;
import com.employee.leave.exception.RequestValidationException;
import com.employee.leave.exception.ResourceNotFoundException;
import com.employee.leave.exception.UnauthorizedOperationException;
import com.employee.leave.repository.*;
import com.employee.leave.security.RequestUser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveTypeRepository leaveTypeRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final NotificationLogRepository notificationLogRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveBalanceAdjustmentRepository leaveBalanceAdjustmentRepository;

    public Flux<LeaveTypeResponseDto> getLeaveTypes() {
        return leaveTypeRepository.findByIsActiveTrue()
                .map(this::mapLeaveTypeToDto);
    }

    public Mono<PagedResponseDto<LeaveTypeResponseDto>> getLeaveTypesAdmin(String search, Boolean isActive, int page, int size) {
        return leaveTypeRepository.findAllByOrderByLeaveTypeIdAsc()
                .filter(lt -> {
                    if (isActive != null && !isActive.equals(lt.getIsActive())) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        boolean matchName = lt.getName() != null && lt.getName().toLowerCase().contains(s);
                        boolean matchCode = lt.getCode() != null && lt.getCode().name().toLowerCase().contains(s);
                        return matchName || matchCode;
                    }
                    return true;
                })
                .map(this::mapLeaveTypeToDto)
                .collectList()
                .map(all -> {
                    int totalElements = all.size();
                    int totalPages = (int) Math.ceil((double) totalElements / size);
                    int fromIndex = Math.min(page * size, totalElements);
                    int toIndex = Math.min(fromIndex + size, totalElements);
                    var pagedList = all.subList(fromIndex, toIndex);

                    return PagedResponseDto.<LeaveTypeResponseDto>builder()
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
    public Mono<LeaveTypeResponseDto> createLeaveType(CreateLeaveTypeRequestDto request) {
        LocalDateTime now = LocalDateTime.now();

        return leaveTypeRepository.findByCode(request.getCode())
                .flatMap(existing -> Mono.<LeaveType>error(new DuplicateResourceException("Leave type code already exists: " + request.getCode())))
                .switchIfEmpty(Mono.defer(() -> {
                    LeaveType lt = LeaveType.builder()
                            .code(request.getCode())
                            .name(request.getName().trim())
                            .description(request.getDescription())
                            .annualQuota(request.getAnnualQuota())
                            .isCarryForward(Boolean.TRUE.equals(request.getIsCarryForward()))
                            .isActive(true)
                            .createdAt(now)
                            .updatedAt(now)
                            .build();
                    return leaveTypeRepository.save(lt);
                }))
                .map(this::mapLeaveTypeToDto);
    }

    @Transactional
    public Mono<LeaveTypeResponseDto> updateLeaveType(Long id, UpdateLeaveTypeRequestDto request) {
        LocalDateTime now = LocalDateTime.now();

        return leaveTypeRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave type not found with ID: " + id)))
                .flatMap(lt -> {
                    lt.setName(request.getName().trim());
                    lt.setDescription(request.getDescription());
                    lt.setAnnualQuota(request.getAnnualQuota());
                    lt.setIsCarryForward(Boolean.TRUE.equals(request.getIsCarryForward()));
                    lt.setUpdatedAt(now);
                    return leaveTypeRepository.save(lt);
                })
                .map(this::mapLeaveTypeToDto);
    }

    @Transactional
    public Mono<LeaveTypeResponseDto> updateLeaveTypeStatus(Long id, Boolean isActive) {
        LocalDateTime now = LocalDateTime.now();

        return leaveTypeRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave type not found with ID: " + id)))
                .flatMap(lt -> {
                    lt.setIsActive(Boolean.TRUE.equals(isActive));
                    lt.setUpdatedAt(now);
                    return leaveTypeRepository.save(lt);
                })
                .map(this::mapLeaveTypeToDto);
    }

    public Flux<LeaveBalanceResponseDto> getLeaveBalances(RequestUser user, Long employeeId, Integer year) {
        int targetYear = year != null ? year : LocalDate.now().getYear();

        if (user.getRole() == Role.EMPLOYEE) {
            if (employeeId != null && !employeeId.equals(user.getEmployeeId())) {
                return Flux.error(new UnauthorizedOperationException("Employees are permitted to view only their own leave balances."));
            }
            return leaveBalanceRepository.findByEmployeeIdAndYear(user.getEmployeeId(), targetYear)
                    .flatMap(this::enrichBalanceToDto);
        }

        if (user.getRole() == Role.MANAGER) {
            Long targetEmpId = (employeeId != null) ? employeeId : user.getEmployeeId();

            if (!targetEmpId.equals(user.getEmployeeId())) {
                return employeeRepository.findById(targetEmpId)
                        .switchIfEmpty(Mono.error(new ResourceNotFoundException("Employee not found with ID: " + targetEmpId)))
                        .flatMapMany(targetEmp -> {
                            if (targetEmp.getManagerId() == null || !targetEmp.getManagerId().equals(user.getEmployeeId())) {
                                return Flux.error(new UnauthorizedOperationException("Managers can view leave balances for their direct reports only."));
                            }
                            return leaveBalanceRepository.findByEmployeeIdAndYear(targetEmpId, targetYear)
                                    .flatMap(this::enrichBalanceToDto);
                        });
            }

            return leaveBalanceRepository.findByEmployeeIdAndYear(targetEmpId, targetYear)
                    .flatMap(this::enrichBalanceToDto);
        }

        // ADMIN and HR
        Long targetEmpId = (employeeId != null) ? employeeId : user.getEmployeeId();
        return leaveBalanceRepository.findByEmployeeIdAndYear(targetEmpId, targetYear)
                .flatMap(this::enrichBalanceToDto);
    }

    public Mono<PagedResponseDto<AdminLeaveBalanceResponseDto>> getAdminBalances(
            Long employeeId,
            Long departmentId,
            Integer year,
            Long leaveTypeId,
            String search,
            int page,
            int size
    ) {
        int targetYear = year != null ? year : LocalDate.now().getYear();

        return employeeRepository.findAll()
                .filter(emp -> {
                    if (employeeId != null && !employeeId.equals(emp.getEmployeeId())) {
                        return false;
                    }
                    if (departmentId != null && !departmentId.equals(emp.getDepartmentId())) {
                        return false;
                    }
                    if (search != null && !search.trim().isEmpty()) {
                        String s = search.trim().toLowerCase();
                        String fullName = (emp.getFirstName() + " " + emp.getLastName()).toLowerCase();
                        String code = emp.getEmployeeCode() != null ? emp.getEmployeeCode().toLowerCase() : "";
                        String email = emp.getEmail() != null ? emp.getEmail().toLowerCase() : "";
                        return fullName.contains(s) || code.contains(s) || email.contains(s);
                    }
                    return true;
                })
                .flatMap(emp -> leaveBalanceRepository.findByEmployeeIdAndYear(emp.getEmployeeId(), targetYear)
                        .filter(bal -> leaveTypeId == null || leaveTypeId.equals(bal.getLeaveTypeId()))
                        .flatMap(bal -> leaveTypeRepository.findById(bal.getLeaveTypeId())
                                .map(lt -> AdminLeaveBalanceResponseDto.builder()
                                        .balanceId(bal.getBalanceId())
                                        .employeeId(emp.getEmployeeId())
                                        .employeeName(emp.getFirstName() + " " + emp.getLastName())
                                        .employeeCode(emp.getEmployeeCode())
                                        .departmentId(emp.getDepartmentId())
                                        .departmentName("Department " + emp.getDepartmentId())
                                        .leaveTypeId(bal.getLeaveTypeId())
                                        .leaveTypeCode(lt.getCode())
                                        .leaveTypeName(lt.getName())
                                        .year(bal.getYear())
                                        .totalDays(bal.getTotalDays())
                                        .usedDays(bal.getUsedDays())
                                        .pendingDays(bal.getPendingDays())
                                        .availableDays(bal.getAvailableDays())
                                        .build()
                                )
                        )
                )
                .collectList()
                .map(all -> {
                    int totalElements = all.size();
                    int totalPages = (int) Math.ceil((double) totalElements / size);
                    int fromIndex = Math.min(page * size, totalElements);
                    int toIndex = Math.min(fromIndex + size, totalElements);
                    var pagedList = all.subList(fromIndex, toIndex);

                    return PagedResponseDto.<AdminLeaveBalanceResponseDto>builder()
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
    public Mono<AdminLeaveBalanceResponseDto> adjustLeaveAllocation(
            Long employeeId,
            Long leaveTypeId,
            AdjustLeaveBalanceRequestDto request,
            RequestUser adminUser
    ) {
        LocalDateTime now = LocalDateTime.now();

        return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, leaveTypeId, request.getYear())
                .switchIfEmpty(Mono.error(new ResourceNotFoundException(
                        "Leave balance not found for employee ID: " + employeeId + " and leave type ID: " + leaveTypeId + " in year " + request.getYear()
                )))
                .flatMap(balance -> {
                    BigDecimal minRequired = balance.getUsedDays().add(balance.getPendingDays());
                    if (request.getNewTotal().compareTo(minRequired) < 0) {
                        return Mono.error(new InvalidOperationException(
                                "New total allocation (" + request.getNewTotal() + ") cannot be less than already used (" + balance.getUsedDays() + ") plus pending (" + balance.getPendingDays() + ") days."
                        ));
                    }

                    BigDecimal previousTotal = balance.getTotalDays();
                    balance.setTotalDays(request.getNewTotal());
                    balance.setAvailableDays(request.getNewTotal().subtract(balance.getUsedDays()).subtract(balance.getPendingDays()));
                    balance.setUpdatedAt(now);

                    LeaveBalanceAdjustment adjustment = LeaveBalanceAdjustment.builder()
                            .employeeId(employeeId)
                            .leaveTypeId(leaveTypeId)
                            .year(request.getYear())
                            .previousTotal(previousTotal)
                            .newTotal(request.getNewTotal())
                            .reason(request.getReason().trim())
                            .performedBy(adminUser != null ? adminUser.getEmail() : "ADMIN")
                            .performedAt(now)
                            .build();

                    return leaveBalanceRepository.save(balance)
                            .then(leaveBalanceAdjustmentRepository.save(adjustment))
                            .flatMap(savedAdj -> Mono.zip(
                                    employeeRepository.findById(employeeId),
                                    leaveTypeRepository.findById(leaveTypeId)
                            ).map(tuple -> AdminLeaveBalanceResponseDto.builder()
                                    .balanceId(balance.getBalanceId())
                                    .employeeId(employeeId)
                                    .employeeName(tuple.getT1().getFirstName() + " " + tuple.getT1().getLastName())
                                    .employeeCode(tuple.getT1().getEmployeeCode())
                                    .departmentId(tuple.getT1().getDepartmentId())
                                    .leaveTypeId(leaveTypeId)
                                    .leaveTypeCode(tuple.getT2().getCode())
                                    .leaveTypeName(tuple.getT2().getName())
                                    .year(balance.getYear())
                                    .totalDays(balance.getTotalDays())
                                    .usedDays(balance.getUsedDays())
                                    .pendingDays(balance.getPendingDays())
                                    .availableDays(balance.getAvailableDays())
                                    .build()
                            ));
                });
    }

    public Flux<LeaveBalanceAdjustmentResponseDto> getBalanceAdjustments(Long employeeId) {
        Flux<LeaveBalanceAdjustment> flux = (employeeId != null)
                ? leaveBalanceAdjustmentRepository.findByEmployeeIdOrderByPerformedAtDesc(employeeId)
                : leaveBalanceAdjustmentRepository.findAllByOrderByPerformedAtDesc();

        return flux.flatMap(adj -> Mono.zip(
                employeeRepository.findById(adj.getEmployeeId()).defaultIfEmpty(Employee.builder().firstName("Emp").lastName("" + adj.getEmployeeId()).employeeCode("EMP" + adj.getEmployeeId()).build()),
                leaveTypeRepository.findById(adj.getLeaveTypeId()).defaultIfEmpty(LeaveType.builder().name("Leave Type " + adj.getLeaveTypeId()).build())
        ).map(tuple -> LeaveBalanceAdjustmentResponseDto.builder()
                .adjustmentId(adj.getAdjustmentId())
                .employeeId(adj.getEmployeeId())
                .employeeName(tuple.getT1().getFirstName() + " " + tuple.getT1().getLastName())
                .employeeCode(tuple.getT1().getEmployeeCode())
                .leaveTypeId(adj.getLeaveTypeId())
                .leaveTypeName(tuple.getT2().getName())
                .year(adj.getYear())
                .previousTotal(adj.getPreviousTotal())
                .newTotal(adj.getNewTotal())
                .reason(adj.getReason())
                .performedBy(adj.getPerformedBy())
                .performedAt(adj.getPerformedAt())
                .build()
        ));
    }

    @Transactional
    public Mono<LeaveRequestResponseDto> applyLeave(RequestUser user, ApplyLeaveRequestDto request) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            return Mono.error(new InvalidOperationException("No employee profile associated with current account"));
        }

        if (request.getEndDate().isBefore(request.getStartDate())) {
            return Mono.error(new RequestValidationException("End date cannot be prior to start date"));
        }

        long daysCount = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        BigDecimal requestedDays = BigDecimal.valueOf(daysCount);
        int requestYear = request.getStartDate().getYear();

        return leaveTypeRepository.findById(request.getLeaveTypeId())
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave type not found with ID: " + request.getLeaveTypeId())))
                .flatMap(lt -> {
                    if (Boolean.FALSE.equals(lt.getIsActive())) {
                        return Mono.error(new InvalidOperationException("Cannot apply for inactive leave type: " + lt.getName()));
                    }

                    return leaveRequestRepository.countOverlappingRequests(employeeId, request.getStartDate(), request.getEndDate())
                            .flatMap(overlapCount -> {
                                if (overlapCount > 0) {
                                    return Mono.error(new InvalidOperationException("You already have an existing leave application covering this date range."));
                                }

                                return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(employeeId, request.getLeaveTypeId(), requestYear)
                                        .switchIfEmpty(Mono.error(new ResourceNotFoundException("No leave balance record found for the requested leave type in year " + requestYear)))
                                        .flatMap(balance -> {
                                            if (balance.getAvailableDays().compareTo(requestedDays) < 0) {
                                                return Mono.error(new InvalidOperationException("Insufficient leave balance. Requested: " + requestedDays + " days, Available: " + balance.getAvailableDays() + " days."));
                                            }

                                            balance.setPendingDays(balance.getPendingDays().add(requestedDays));
                                            balance.setAvailableDays(balance.getAvailableDays().subtract(requestedDays));
                                            balance.setUpdatedAt(LocalDateTime.now());

                                            return leaveBalanceRepository.save(balance)
                                                    .flatMap(savedBalance -> {
                                                        LeaveRequest leaveRequest = LeaveRequest.builder()
                                                                .employeeId(employeeId)
                                                                .leaveTypeId(request.getLeaveTypeId())
                                                                .startDate(request.getStartDate())
                                                                .endDate(request.getEndDate())
                                                                .totalDays(requestedDays)
                                                                .reason(request.getReason().trim())
                                                                .status(LeaveRequestStatus.PENDING)
                                                                .createdAt(LocalDateTime.now())
                                                                .updatedAt(LocalDateTime.now())
                                                                .build();

                                                        return leaveRequestRepository.save(leaveRequest)
                                                                .flatMap(savedReq -> logLeaveNotification(savedReq, user.getEmail(), "LEAVE_APPLICATION")
                                                                        .thenReturn(savedReq)
                                                                );
                                                    });
                                        });
                            });
                })
                .flatMap(this::enrichRequestToDto);
    }

    @Transactional
    public Mono<LeaveRequestResponseDto> cancelLeave(Long leaveRequestId, RequestUser user) {
        return leaveRequestRepository.findById(leaveRequestId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave request not found with ID: " + leaveRequestId)))
                .flatMap(req -> {
                    if (user.getRole() == Role.EMPLOYEE && !req.getEmployeeId().equals(user.getEmployeeId())) {
                        return Mono.error(new InvalidOperationException("You can only cancel your own leave requests."));
                    }

                    if (req.getStatus() == LeaveRequestStatus.CANCELLED || req.getStatus() == LeaveRequestStatus.REJECTED) {
                        return Mono.error(new InvalidOperationException("Cannot cancel leave request that is already " + req.getStatus()));
                    }

                    int year = req.getStartDate().getYear();

                    return leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(req.getEmployeeId(), req.getLeaveTypeId(), year)
                            .flatMap(balance -> {
                                if (req.getStatus() == LeaveRequestStatus.PENDING) {
                                    balance.setPendingDays(balance.getPendingDays().subtract(req.getTotalDays()));
                                    balance.setAvailableDays(balance.getAvailableDays().add(req.getTotalDays()));
                                } else if (req.getStatus() == LeaveRequestStatus.APPROVED) {
                                    balance.setUsedDays(balance.getUsedDays().subtract(req.getTotalDays()));
                                    balance.setAvailableDays(balance.getAvailableDays().add(req.getTotalDays()));
                                }

                                balance.setUpdatedAt(LocalDateTime.now());

                                req.setStatus(LeaveRequestStatus.CANCELLED);
                                req.setUpdatedAt(LocalDateTime.now());

                                return leaveBalanceRepository.save(balance)
                                        .then(leaveRequestRepository.save(req));
                            });
                })
                .flatMap(this::enrichRequestToDto);
    }

    @Transactional
    public Mono<LeaveRequestResponseDto> approveLeave(Long leaveRequestId, LeaveDecisionRequestDto decision, RequestUser approver) {
        return leaveRequestRepository.findById(leaveRequestId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave request not found with ID: " + leaveRequestId)))
                .flatMap(req -> {
                    if (req.getEmployeeId().equals(approver.getEmployeeId())) {
                        return Mono.error(new InvalidOperationException("Users cannot approve their own leave requests"));
                    }

                    if (req.getStatus() != LeaveRequestStatus.PENDING) {
                        return Mono.error(new InvalidOperationException("Cannot approve request. It is already in status " + req.getStatus()));
                    }

                    Mono<Void> authorizationCheck = (approver.getRole() == Role.MANAGER)
                            ? employeeRepository.findById(req.getEmployeeId())
                                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Requester employee not found with ID: " + req.getEmployeeId())))
                                .flatMap(emp -> {
                                    if (emp.getManagerId() == null || !emp.getManagerId().equals(approver.getEmployeeId())) {
                                        return Mono.error(new UnauthorizedOperationException("Managers can review leave requests for direct reports only."));
                                    }
                                    return Mono.empty();
                                })
                            : Mono.empty();

                    int year = req.getStartDate().getYear();

                    return authorizationCheck
                            .then(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(req.getEmployeeId(), req.getLeaveTypeId(), year))
                            .flatMap(balance -> {
                                balance.setPendingDays(balance.getPendingDays().subtract(req.getTotalDays()));
                                balance.setUsedDays(balance.getUsedDays().add(req.getTotalDays()));
                                balance.setUpdatedAt(LocalDateTime.now());

                                req.setStatus(LeaveRequestStatus.APPROVED);
                                req.setApproverId(approver.getEmployeeId());
                                req.setApproverComments(decision != null && decision.getComment() != null ? decision.getComment().trim() : "Approved");
                                req.setDecisionDate(LocalDateTime.now());
                                req.setUpdatedAt(LocalDateTime.now());

                                return leaveBalanceRepository.save(balance)
                                        .then(leaveRequestRepository.save(req))
                                        .flatMap(savedReq -> logLeaveNotification(savedReq, approver.getEmail(), "LEAVE_APPROVAL")
                                                .thenReturn(savedReq)
                                        );
                            });
                })
                .flatMap(this::enrichRequestToDto);
    }

    @Transactional
    public Mono<LeaveRequestResponseDto> rejectLeave(Long leaveRequestId, LeaveDecisionRequestDto decision, RequestUser approver) {
        if (decision == null || decision.getComment() == null || decision.getComment().trim().isEmpty()) {
            return Mono.error(new InvalidOperationException("Rejection reason is mandatory"));
        }

        return leaveRequestRepository.findById(leaveRequestId)
                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Leave request not found with ID: " + leaveRequestId)))
                .flatMap(req -> {
                    if (req.getEmployeeId().equals(approver.getEmployeeId())) {
                        return Mono.error(new InvalidOperationException("Users cannot reject their own leave requests"));
                    }

                    if (req.getStatus() != LeaveRequestStatus.PENDING) {
                        return Mono.error(new InvalidOperationException("Cannot reject request. It is already in status " + req.getStatus()));
                    }

                    Mono<Void> authorizationCheck = (approver.getRole() == Role.MANAGER)
                            ? employeeRepository.findById(req.getEmployeeId())
                                .switchIfEmpty(Mono.error(new ResourceNotFoundException("Requester employee not found with ID: " + req.getEmployeeId())))
                                .flatMap(emp -> {
                                    if (emp.getManagerId() == null || !emp.getManagerId().equals(approver.getEmployeeId())) {
                                        return Mono.error(new UnauthorizedOperationException("Managers can review leave requests for direct reports only."));
                                    }
                                    return Mono.empty();
                                })
                            : Mono.empty();

                    int year = req.getStartDate().getYear();

                    return authorizationCheck
                            .then(leaveBalanceRepository.findByEmployeeIdAndLeaveTypeIdAndYear(req.getEmployeeId(), req.getLeaveTypeId(), year))
                            .flatMap(balance -> {
                                balance.setPendingDays(balance.getPendingDays().subtract(req.getTotalDays()));
                                balance.setAvailableDays(balance.getAvailableDays().add(req.getTotalDays()));
                                balance.setUpdatedAt(LocalDateTime.now());

                                req.setStatus(LeaveRequestStatus.REJECTED);
                                req.setApproverId(approver.getEmployeeId());
                                req.setApproverComments(decision.getComment().trim());
                                req.setDecisionDate(LocalDateTime.now());
                                req.setUpdatedAt(LocalDateTime.now());

                                return leaveBalanceRepository.save(balance)
                                        .then(leaveRequestRepository.save(req))
                                        .flatMap(savedReq -> logLeaveNotification(savedReq, approver.getEmail(), "LEAVE_REJECTION")
                                                .thenReturn(savedReq)
                                        );
                            });
                })
                .flatMap(this::enrichRequestToDto);
    }

    public Mono<PagedResponseDto<LeaveRequestResponseDto>> getLeaveHistory(
            RequestUser user,
            Long employeeId,
            String status,
            Integer year,
            int page,
            int size
    ) {
        Long targetEmpId = (user.getRole() == Role.EMPLOYEE) ? user.getEmployeeId() : employeeId;

        int safePage = Math.max(0, page);
        int safeSize = size <= 0 ? 10 : Math.min(size, 100);
        long offset = (long) safePage * safeSize;

        String statusFilter = (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status))
                ? status.trim().toUpperCase() : null;

        return leaveRequestRepository.countFiltered(targetEmpId, statusFilter, year)
                .flatMap(totalElements -> {
                    if (totalElements == 0) {
                        return Mono.just(PagedResponseDto.<LeaveRequestResponseDto>builder()
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

                    return leaveRequestRepository.findFiltered(targetEmpId, statusFilter, year, safeSize, offset)
                            .flatMap(this::enrichRequestToDto)
                            .collectList()
                            .map(list -> PagedResponseDto.<LeaveRequestResponseDto>builder()
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

    public Flux<LeaveRequestResponseDto> getPendingApprovals(RequestUser approver) {
        if (approver.getRole() == Role.MANAGER) {
            return leaveRequestRepository.findPendingByManagerId(approver.getEmployeeId())
                    .flatMap(this::enrichRequestToDto);
        }

        return leaveRequestRepository.findAllPending()
                .flatMap(this::enrichRequestToDto);
    }

    public Flux<TeamLeaveCalendarDto> getTeamLeaveCalendar(LocalDate startDate, LocalDate endDate, Long departmentId) {
        LocalDate start = startDate != null ? startDate : LocalDate.now().withDayOfMonth(1);
        LocalDate end = endDate != null ? endDate : start.plusMonths(1);

        return leaveRequestRepository.findApprovedInDateRange(start, end)
                .flatMap(req -> employeeRepository.findById(req.getEmployeeId())
                        .filter(emp -> departmentId == null || departmentId.equals(emp.getDepartmentId()))
                        .flatMap(emp -> leaveTypeRepository.findById(req.getLeaveTypeId())
                                .map(lt -> TeamLeaveCalendarDto.builder()
                                        .leaveRequestId(req.getLeaveRequestId())
                                        .employeeId(emp.getEmployeeId())
                                        .employeeCode(emp.getEmployeeCode())
                                        .employeeName(emp.getFirstName() + " " + emp.getLastName())
                                        .departmentId(emp.getDepartmentId())
                                        .leaveTypeCode(lt.getCode())
                                        .leaveTypeName(lt.getName())
                                        .startDate(req.getStartDate())
                                        .endDate(req.getEndDate())
                                        .totalDays(req.getTotalDays())
                                        .status(req.getStatus())
                                        .build()
                                )
                        )
                );
    }

    private LeaveTypeResponseDto mapLeaveTypeToDto(LeaveType lt) {
        return LeaveTypeResponseDto.builder()
                .leaveTypeId(lt.getLeaveTypeId())
                .code(lt.getCode())
                .name(lt.getName())
                .description(lt.getDescription())
                .annualQuota(lt.getAnnualQuota())
                .isCarryForward(lt.getIsCarryForward())
                .isActive(Boolean.TRUE.equals(lt.getIsActive()))
                .build();
    }

    private Mono<LeaveBalanceResponseDto> enrichBalanceToDto(LeaveBalance balance) {
        return leaveTypeRepository.findById(balance.getLeaveTypeId())
                .map(lt -> LeaveBalanceResponseDto.builder()
                        .balanceId(balance.getBalanceId())
                        .employeeId(balance.getEmployeeId())
                        .leaveTypeId(balance.getLeaveTypeId())
                        .leaveTypeCode(lt.getCode())
                        .leaveTypeName(lt.getName())
                        .year(balance.getYear())
                        .totalDays(balance.getTotalDays())
                        .usedDays(balance.getUsedDays())
                        .pendingDays(balance.getPendingDays())
                        .availableDays(balance.getAvailableDays())
                        .updatedAt(balance.getUpdatedAt())
                        .build()
                );
    }

    private Mono<LeaveRequestResponseDto> enrichRequestToDto(LeaveRequest req) {
        Mono<Employee> employeeMono = employeeRepository.findById(req.getEmployeeId());
        Mono<LeaveType> leaveTypeMono = leaveTypeRepository.findById(req.getLeaveTypeId());
        Mono<String> approverNameMono = req.getApproverId() != null
                ? employeeRepository.findById(req.getApproverId()).map(a -> a.getFirstName() + " " + a.getLastName()).defaultIfEmpty("N/A")
                : Mono.just("Pending");

        return Mono.zip(employeeMono, leaveTypeMono, approverNameMono)
                .map(tuple -> {
                    Employee emp = tuple.getT1();
                    LeaveType lt = tuple.getT2();
                    String approverName = tuple.getT3();

                    return LeaveRequestResponseDto.builder()
                            .leaveRequestId(req.getLeaveRequestId())
                            .employeeId(req.getEmployeeId())
                            .employeeCode(emp.getEmployeeCode())
                            .employeeName(emp.getFirstName() + " " + emp.getLastName())
                            .leaveTypeId(req.getLeaveTypeId())
                            .leaveTypeCode(lt.getCode())
                            .leaveTypeName(lt.getName())
                            .startDate(req.getStartDate())
                            .endDate(req.getEndDate())
                            .totalDays(req.getTotalDays())
                            .reason(req.getReason())
                            .status(req.getStatus())
                            .approverId(req.getApproverId())
                            .approverName(approverName)
                            .approverComments(req.getApproverComments())
                            .decisionDate(req.getDecisionDate())
                            .createdAt(req.getCreatedAt())
                            .updatedAt(req.getUpdatedAt())
                            .build();
                });
    }

    private Mono<Void> logLeaveNotification(LeaveRequest req, String performerEmail, String actionType) {
        NotificationLog notification = NotificationLog.builder()
                .recipientEmail(performerEmail)
                .recipientId(req.getEmployeeId())
                .subject("Leave Request Update: " + req.getStatus())
                .message("Leave request for " + req.getStartDate() + " to " + req.getEndDate() + " status is now " + req.getStatus())
                .type(actionType)
                .status("SENT")
                .createdAt(LocalDateTime.now())
                .build();

        return notificationLogRepository.save(notification).then();
    }
}
