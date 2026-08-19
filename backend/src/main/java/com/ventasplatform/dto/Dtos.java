package com.ventasplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record RegisterRequest(
    @NotBlank String fullName,
    @NotBlank @Email String email,
    @NotBlank @Size(min = 6) String password
) {}

public record ProductDTO(
    Long id,
    @NotBlank String name,
    String description,
    @NotBlank String category,
    @NotNull @Positive BigDecimal price,
    @Positive Integer stock,
    boolean active
) {}

public record OrderDTO(
    Long id,
    @NotBlank String clientName,
    @NotBlank @Email String clientEmail,
    java.util.List<OrderItemDTO> items,
    String status,
    java.math.BigDecimal total,
    String createdAt
) {}

public record OrderItemDTO(
    Long productId,
    String productName,
    @NotNull @Positive Integer quantity,
    java.math.BigDecimal unitPrice,
    java.math.BigDecimal subtotal
) {}

public record CreateOrderRequest(
    @NotBlank String clientName,
    @NotBlank @Email String clientEmail,
    @NotBlank java.util.List<OrderItemRequest> items
) {}

public record OrderItemRequest(
    @NotNull Long productId,
    @NotNull @Positive Integer quantity
) {}
