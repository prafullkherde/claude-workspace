package com.todo.dto.auth;

public record AuthResponse(
        String token,
        String name,
        String email
) {}
