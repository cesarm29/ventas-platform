package com.ventasplatform.dto;

public record AuthResponse(
    String token,
    String email,
    String fullName,
    String role,
    long expiresIn
) {}
