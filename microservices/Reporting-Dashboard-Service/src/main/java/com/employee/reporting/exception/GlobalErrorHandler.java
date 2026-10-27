package com.employee.reporting.exception;

import com.employee.reporting.dto.response.ErrorResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@RestControllerAdvice
public class GlobalErrorHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalErrorHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleResourceNotFound(
            ResourceNotFoundException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Resource not found: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, ex.getMessage(), exchange.getRequest().getPath().value())));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleAccessDenied(
            AccessDeniedException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Access denied: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "Access denied. Insufficient permissions.", exchange.getRequest().getPath().value())));
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleGeneralException(
            Exception ex,
            ServerWebExchange exchange
    ) {
        log.error("Unhandled internal server error on {}: {}", exchange.getRequest().getPath().value(), ex.getMessage(), ex);
        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "An internal error occurred. Please try again later.", exchange.getRequest().getPath().value())));
    }

    private ErrorResponseDto buildError(HttpStatus status, String message, String path) {
        return ErrorResponseDto.builder()
                .success(false)
                .status(status.value())
                .error(status.getReasonPhrase())
                .message(message)
                .path(path)
                .build();
    }
}
