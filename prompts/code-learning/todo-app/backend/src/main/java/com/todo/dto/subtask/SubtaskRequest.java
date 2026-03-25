package com.todo.dto.subtask;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SubtaskRequest(
        @NotBlank(message = "Subtask title is required")
        @Size(max = 255, message = "Title must not exceed 255 characters")
        String title
) {}
