package com.todo.dto.subtask;

public record SubtaskResponse(
        Long id,
        String title,
        boolean completed
) {}
