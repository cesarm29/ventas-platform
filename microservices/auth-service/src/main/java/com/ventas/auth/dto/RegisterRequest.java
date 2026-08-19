package com.ventas.auth.dto;

import jakarta.validation.constraints.*;

public record RegisterRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String password
) {}
