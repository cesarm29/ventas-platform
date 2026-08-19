package com.ventas.orders.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record CreateOrderRequest(
    @NotBlank String clientName,
    @NotBlank @Email String clientEmail,
    @NotEmpty List<OrderItemRequest> items
) {}
