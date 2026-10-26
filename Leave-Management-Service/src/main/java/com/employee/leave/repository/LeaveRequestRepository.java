package com.employee.leave.repository;

import com.employee.leave.entity.LeaveRequest;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface LeaveRequestRepository extends ReactiveCrudRepository<LeaveRequest, Long> {

    Flux<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    @Query("SELECT COUNT(*) FROM leave_requests lr WHERE lr.employee_id = :employeeId " +
           "AND lr.status IN ('PENDING', 'APPROVED') " +
           "AND (:startDate <= lr.end_date AND :endDate >= lr.start_date)")
    Mono<Long> countOverlappingRequests(Long employeeId, LocalDate startDate, LocalDate endDate);

    @Query("SELECT lr.* FROM leave_requests lr WHERE (:employeeId IS NULL OR lr.employee_id = :employeeId) " +
           "AND (:status IS NULL OR lr.status = :status) " +
           "AND (:year IS NULL OR YEAR(lr.start_date) = :year) " +
           "ORDER BY lr.created_at DESC LIMIT :limit OFFSET :offset")
    Flux<LeaveRequest> findFiltered(Long employeeId, String status, Integer year, long limit, long offset);

    @Query("SELECT COUNT(*) FROM leave_requests lr WHERE (:employeeId IS NULL OR lr.employee_id = :employeeId) " +
           "AND (:status IS NULL OR lr.status = :status) " +
           "AND (:year IS NULL OR YEAR(lr.start_date) = :year)")
    Mono<Long> countFiltered(Long employeeId, String status, Integer year);

    @Query("SELECT lr.* FROM leave_requests lr INNER JOIN employees e ON lr.employee_id = e.employee_id " +
           "WHERE lr.status = 'PENDING' AND e.manager_id = :managerId ORDER BY lr.created_at ASC")
    Flux<LeaveRequest> findPendingByManagerId(Long managerId);

    @Query("SELECT lr.* FROM leave_requests lr WHERE lr.status = 'PENDING' ORDER BY lr.created_at ASC")
    Flux<LeaveRequest> findAllPending();

    @Query("SELECT lr.* FROM leave_requests lr WHERE lr.status = 'APPROVED' " +
           "AND (:startDate <= lr.end_date AND :endDate >= lr.start_date) ORDER BY lr.start_date ASC")
    Flux<LeaveRequest> findApprovedInDateRange(LocalDate startDate, LocalDate endDate);
}
