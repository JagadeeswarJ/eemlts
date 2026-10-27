package com.employee.leave.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("notification_logs")
public class NotificationLog {

    @Id
    @Column("notification_id")
    private Long notificationId;

    @Column("recipient_email")
    private String recipientEmail;

    @Column("recipient_id")
    private Long recipientId;

    @Column("subject")
    private String subject;

    @Column("message")
    private String message;

    @Column("type")
    private String type;

    @Column("status")
    private String status;

    @Column("created_at")
    private LocalDateTime createdAt;
}
