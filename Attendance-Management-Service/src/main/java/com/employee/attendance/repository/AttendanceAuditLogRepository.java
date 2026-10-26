package com.employee.attendance.repository;

import com.employee.attendance.entity.AttendanceAuditLog;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface AttendanceAuditLogRepository extends ReactiveCrudRepository<AttendanceAuditLog, Long> {

    Flux<AttendanceAuditLog> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Flux<AttendanceAuditLog> findAllByOrderByCreatedAtDesc();
}
