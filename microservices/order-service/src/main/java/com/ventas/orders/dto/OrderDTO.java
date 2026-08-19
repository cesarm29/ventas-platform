package com.ventas.orders.dto;

import java.math.BigDecimal;
import java.util.List;

public record OrderDTO(Long id, String clientName, String clientEmail, List<OrderItemDTO> items,
                       String status, BigDecimal total, String createdAt) {}
