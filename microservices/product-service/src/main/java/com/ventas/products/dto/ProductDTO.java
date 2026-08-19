package com.ventas.products.dto;

import jakarta.validation.constraints.*;
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
