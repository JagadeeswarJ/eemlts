package com.employee.gateway.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorResponseDto {

    private boolean success;
    private int status;
    private String error;
    private String message;
    private String path;
    @Builder.Default
    private String timestamp = LocalDateTime.now().toString();
}
