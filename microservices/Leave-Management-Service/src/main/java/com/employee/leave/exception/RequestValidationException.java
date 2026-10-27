package com.employee.leave.exception;

import java.util.List;

public class RequestValidationException extends RuntimeException {

    private final List<String> errors;

    public RequestValidationException(String message) {
        super(message);
        this.errors = List.of(message);
    }

    public RequestValidationException(List<String> errors) {
        super(errors.isEmpty() ? "Validation failed" : String.join(", ", errors));
        this.errors = errors;
    }

    public List<String> getErrors() {
        return errors;
    }
}
