package com.employee.reporting.repository;

import com.employee.reporting.entity.LeaveBalance;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface LeaveBalanceRepository extends ReactiveCrudRepository<LeaveBalance, Long> {

    Flux<LeaveBalance> findByEmployeeIdAndYear(Long employeeId, Integer year);

    Flux<LeaveBalance> findByYear(Integer year);
}
