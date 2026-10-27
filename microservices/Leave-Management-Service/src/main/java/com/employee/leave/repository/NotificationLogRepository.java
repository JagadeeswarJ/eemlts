package com.employee.leave.repository;

import com.employee.leave.entity.NotificationLog;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationLogRepository extends ReactiveCrudRepository<NotificationLog, Long> {
}
