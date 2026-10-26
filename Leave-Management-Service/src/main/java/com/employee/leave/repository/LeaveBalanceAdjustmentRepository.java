package com.employee.leave.repository;

import com.employee.leave.entity.LeaveBalanceAdjustment;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface LeaveBalanceAdjustmentRepository extends ReactiveCrudRepository<LeaveBalanceAdjustment, Long> {

    Flux<LeaveBalanceAdjustment> findAllByOrderByPerformedAtDesc();

    Flux<LeaveBalanceAdjustment> findByEmployeeIdOrderByPerformedAtDesc(Long employeeId);
}
