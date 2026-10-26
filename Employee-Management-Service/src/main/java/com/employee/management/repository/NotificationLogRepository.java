package com.employee.management.repository;

import com.employee.management.entity.NotificationLog;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

@Repository
public interface NotificationLogRepository extends ReactiveCrudRepository<NotificationLog, Long> {

    Flux<NotificationLog> findByRecipientEmail(String recipientEmail);
}
