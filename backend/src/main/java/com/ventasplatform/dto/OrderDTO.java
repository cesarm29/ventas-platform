package com.ventasplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.util.List;

public record OrderDTO(
    Long id,
    @NotBlank String clientName,
    @NotBlank @Email String clientEmail,
    List<OrderItemDTO> items,
    String status,
    BigDecimal total,
    String createdAt
) {}
