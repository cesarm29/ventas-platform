package com.ventasplatform.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String clientName,
    @NotBlank @Email String clientEmail,
    @NotBlank List<OrderItemRequest> items
) {}
