package com.employee.management.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSelfProfileRequestDto {

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[0-9+()\\s.-]{7,25}$", message = "Please provide a valid phone number format")
    private String phone;

    @NotBlank(message = "Residential address is required")
    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @NotBlank(message = "Emergency contact is required")
    @Size(max = 100, message = "Emergency contact must not exceed 100 characters")
    private String emergencyContact;
}
