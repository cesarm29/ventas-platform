package com.ventasplatform.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record OrderItemDTO(
    Long productId,
    String productName,
    @NotNull @Positive Integer quantity,
    BigDecimal unitPrice,
    BigDecimal subtotal
) {}
