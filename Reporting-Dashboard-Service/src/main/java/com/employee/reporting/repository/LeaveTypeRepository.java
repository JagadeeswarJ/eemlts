package com.employee.reporting.repository;

import com.employee.reporting.entity.LeaveType;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LeaveTypeRepository extends ReactiveCrudRepository<LeaveType, Long> {
}
