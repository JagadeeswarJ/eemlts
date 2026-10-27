package com.employee.leave.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdjustLeaveBalanceRequestDto {

    @NotNull(message = "Year is required")
    private Integer year;

    @NotNull(message = "New total allocation is required")
    @DecimalMin(value = "0.0", message = "New total allocation cannot be negative")
    private BigDecimal newTotal;

    @NotBlank(message = "Adjustment reason is mandatory for audit trail")
    @Size(max = 500, message = "Reason must not exceed 500 characters")
    private String reason;
}
