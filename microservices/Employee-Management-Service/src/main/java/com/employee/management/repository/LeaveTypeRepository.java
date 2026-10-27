package com.employee.management.repository;

import com.employee.management.entity.LeaveType;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

@Repository
public interface LeaveTypeRepository extends ReactiveCrudRepository<LeaveType, Long> {

    Mono<LeaveType> findByCode(String code);
}
