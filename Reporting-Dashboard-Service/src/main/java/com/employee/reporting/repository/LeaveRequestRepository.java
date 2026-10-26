package com.employee.reporting.repository;

import com.employee.reporting.entity.LeaveRequest;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface LeaveRequestRepository extends ReactiveCrudRepository<LeaveRequest, Long> {

    Flux<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Flux<LeaveRequest> findByStatus(String status);

    Mono<Long> countByStatus(String status);

    @Query("SELECT lr.* FROM leave_requests lr INNER JOIN employees e ON lr.employee_id = e.employee_id " +
           "WHERE lr.status = 'PENDING' AND e.manager_id = :managerId")
    Flux<LeaveRequest> findPendingByManagerId(Long managerId);

    @Query("SELECT lr.* FROM leave_requests lr WHERE YEAR(lr.start_date) = :year")
    Flux<LeaveRequest> findAllByYear(int year);

    @Query("SELECT lr.* FROM leave_requests lr WHERE lr.status = 'APPROVED' AND (:date BETWEEN lr.start_date AND lr.end_date)")
    Flux<LeaveRequest> findApprovedOnDate(LocalDate date);
}
