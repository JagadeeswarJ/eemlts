package com.employee.attendance.exception;

import com.employee.attendance.dto.response.ErrorResponseDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.bind.support.WebExchangeBindException;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;

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

    @ExceptionHandler(InvalidOperationException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleInvalidOperation(
            InvalidOperationException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Invalid operation: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), exchange.getRequest().getPath().value())));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleAccessDenied(
            AccessDeniedException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Access denied: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "Access denied. Insufficient privileges.", exchange.getRequest().getPath().value())));
    }

    @ExceptionHandler(UnauthorizedOperationException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleUnauthorizedOperation(
            UnauthorizedOperationException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Unauthorized operation: {}", ex.getMessage());
        return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, ex.getMessage(), exchange.getRequest().getPath().value())));
    }

    @ExceptionHandler(RequestValidationException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleRequestValidation(
            RequestValidationException ex,
            ServerWebExchange exchange
    ) {
        log.warn("Validation error: {}", ex.getMessage());
        ErrorResponseDto errorDto = buildError(HttpStatus.BAD_REQUEST, ex.getMessage(), exchange.getRequest().getPath().value());
        errorDto.setDetails(ex.getErrors());
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto));
    }

    @ExceptionHandler(WebExchangeBindException.class)
    public Mono<ResponseEntity<ErrorResponseDto>> handleValidationErrors(
            WebExchangeBindException ex,
            ServerWebExchange exchange
    ) {
        List<String> details = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.toList());

        String message = details.isEmpty() ? "Invalid request payload" : details.get(0);
        log.warn("Payload validation failure on {}: {}", exchange.getRequest().getPath().value(), details);

        ErrorResponseDto errorDto = buildError(HttpStatus.BAD_REQUEST, message, exchange.getRequest().getPath().value());
        errorDto.setDetails(details);
        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDto));
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
