package com.ventasplatform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record ProductDTO(
    Long id,
    @NotBlank String name,
    String description,
    @NotBlank String category,
    @NotNull @Positive BigDecimal price,
    @Positive Integer stock,
    boolean active
) {}
