package com.ventas.orders.dto;

import java.time.Instant;

public record ApiResponse<T>(boolean success, String message, T data, Instant timestamp, PageInfo pageInfo) {
    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, "OK", data, Instant.now(), null);
    }
    public static <T> ApiResponse<T> ok(T data, PageInfo pageInfo) {
        return new ApiResponse<>(true, "OK", data, Instant.now(), pageInfo);
    }
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, message, null, Instant.now(), null);
    }
    public record PageInfo(int page, int size, long totalElements, int totalPages) {}
}
