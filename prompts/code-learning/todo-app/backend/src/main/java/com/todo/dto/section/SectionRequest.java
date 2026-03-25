package com.todo.dto.section;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SectionRequest(
        @NotBlank(message = "Section name is required")
        @Size(max = 100, message = "Section name must not exceed 100 characters")
        String name
) {}
