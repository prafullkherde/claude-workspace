package com.todo.controller;

import com.todo.dto.subtask.SubtaskRequest;
import com.todo.dto.subtask.SubtaskResponse;
import com.todo.model.User;
import com.todo.service.SubtaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks/{taskId}/subtasks")
@RequiredArgsConstructor
public class SubtaskController {

    private final SubtaskService subtaskService;

    @GetMapping
    public ResponseEntity<List<SubtaskResponse>> getSubtasks(
            @AuthenticationPrincipal User user,
            @PathVariable Long taskId
    ) {
        return ResponseEntity.ok(subtaskService.getSubtasks(user, taskId));
    }

    @PostMapping
    public ResponseEntity<SubtaskResponse> addSubtask(
            @AuthenticationPrincipal User user,
            @PathVariable Long taskId,
            @Valid @RequestBody SubtaskRequest request
    ) {
        SubtaskResponse response = subtaskService.addSubtask(user, taskId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubtaskResponse> updateSubtask(
            @AuthenticationPrincipal User user,
            @PathVariable Long taskId,
            @PathVariable Long id,
            @Valid @RequestBody SubtaskRequest request
    ) {
        return ResponseEntity.ok(subtaskService.updateSubtask(user, taskId, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubtask(
            @AuthenticationPrincipal User user,
            @PathVariable Long taskId,
            @PathVariable Long id
    ) {
        subtaskService.deleteSubtask(user, taskId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<SubtaskResponse> toggleSubtask(
            @AuthenticationPrincipal User user,
            @PathVariable Long taskId,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(subtaskService.toggleSubtaskComplete(user, taskId, id));
    }
}
