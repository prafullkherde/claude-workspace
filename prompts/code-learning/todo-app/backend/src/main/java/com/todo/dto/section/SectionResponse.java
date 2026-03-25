package com.todo.dto.section;

public record SectionResponse(
        Long id,
        String name,
        boolean isDefault,
        long taskCount
) {}
