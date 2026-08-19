package com.ventas.orders.dto;

import java.math.BigDecimal;

public record ProductDTO(Long id, String name, String description, String category, BigDecimal price, Integer stock, boolean active) {}
