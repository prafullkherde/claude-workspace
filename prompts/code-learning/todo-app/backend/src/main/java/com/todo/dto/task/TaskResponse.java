package com.todo.dto.task;

import com.todo.dto.subtask.SubtaskResponse;
import com.todo.model.Priority;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record TaskResponse(
        Long id,
        String title,
        String description,
        Priority priority,
        LocalDate dueDate,
        boolean completed,
        LocalDateTime createdAt,
        Long sectionId,
        String sectionName,
        List<SubtaskResponse> subtasks
) {}
