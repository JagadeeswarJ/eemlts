package com.employee.leave.repository;

import com.employee.leave.entity.LeaveBalance;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface LeaveBalanceRepository extends ReactiveCrudRepository<LeaveBalance, Long> {

    Flux<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);

    Mono<LeaveBalance> findByEmployeeIdAndLeaveTypeIdAndYear(Long employeeId, Long leaveTypeId, Integer year);
}
