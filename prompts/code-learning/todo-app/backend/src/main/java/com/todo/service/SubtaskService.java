package com.todo.service;

import com.todo.dto.subtask.SubtaskRequest;
import com.todo.dto.subtask.SubtaskResponse;
import com.todo.exception.ResourceNotFoundException;
import com.todo.model.Subtask;
import com.todo.model.Task;
import com.todo.model.User;
import com.todo.repository.SubtaskRepository;
import com.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubtaskService {

    private final SubtaskRepository subtaskRepository;
    private final TaskRepository taskRepository;

    @Transactional(readOnly = true)
    public List<SubtaskResponse> getSubtasks(User user, Long taskId) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        return subtaskRepository.findByTask(task)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SubtaskResponse addSubtask(User user, Long taskId, SubtaskRequest request) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Subtask subtask = Subtask.builder()
                .title(request.title())
                .completed(false)
                .task(task)
                .build();

        subtask = subtaskRepository.save(subtask);
        return toResponse(subtask);
    }

    @Transactional
    public SubtaskResponse updateSubtask(User user, Long taskId, Long subtaskId, SubtaskRequest request) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Subtask subtask = subtaskRepository.findByIdAndTask(subtaskId, task)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask", subtaskId));

        subtask.setTitle(request.title());
        subtask = subtaskRepository.save(subtask);
        return toResponse(subtask);
    }

    @Transactional
    public void deleteSubtask(User user, Long taskId, Long subtaskId) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Subtask subtask = subtaskRepository.findByIdAndTask(subtaskId, task)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask", subtaskId));

        subtaskRepository.delete(subtask);
    }

    @Transactional
    public SubtaskResponse toggleSubtaskComplete(User user, Long taskId, Long subtaskId) {
        Task task = taskRepository.findByIdAndUser(taskId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", taskId));

        Subtask subtask = subtaskRepository.findByIdAndTask(subtaskId, task)
                .orElseThrow(() -> new ResourceNotFoundException("Subtask", subtaskId));

        subtask.setCompleted(!subtask.isCompleted());
        subtask = subtaskRepository.save(subtask);
        return toResponse(subtask);
    }

    private SubtaskResponse toResponse(Subtask subtask) {
        return new SubtaskResponse(subtask.getId(), subtask.getTitle(), subtask.isCompleted());
    }
}
