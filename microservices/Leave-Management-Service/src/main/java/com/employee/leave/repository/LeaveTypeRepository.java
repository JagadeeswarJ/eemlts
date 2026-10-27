package com.employee.leave.repository;

import com.employee.leave.entity.LeaveType;
import com.employee.leave.enums.LeaveTypeCode;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Repository
public interface LeaveTypeRepository extends ReactiveCrudRepository<LeaveType, Long> {

    Mono<LeaveType> findByCode(LeaveTypeCode code);

    Flux<LeaveType> findByIsActiveTrue();

    Flux<LeaveType> findAllByOrderByLeaveTypeIdAsc();

    Mono<Boolean> existsByCode(LeaveTypeCode code);
}
