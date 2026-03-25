package com.todo.service;

import com.todo.dto.subtask.SubtaskResponse;
import com.todo.dto.task.TaskRequest;
import com.todo.dto.task.TaskResponse;
import com.todo.exception.ResourceNotFoundException;
import com.todo.model.Section;
import com.todo.model.Task;
import com.todo.model.User;
import com.todo.repository.SectionRepository;
import com.todo.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;
    private final SectionRepository sectionRepository;

    @Transactional(readOnly = true)
    public List<TaskResponse> getTasks(User user, Long sectionId) {
        List<Task> tasks;

        if (sectionId != null) {
            Section section = sectionRepository.findByIdAndUser(sectionId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Section", sectionId));
            tasks = taskRepository.findByUserAndSection(user, section);
        } else {
            tasks = taskRepository.findByUser(user);
        }

        return tasks.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(User user, Long id) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        return toResponse(task);
    }

    @Transactional
    public TaskResponse createTask(User user, TaskRequest request) {
        Section section = null;
        if (request.sectionId() != null) {
            section = sectionRepository.findByIdAndUser(request.sectionId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Section", request.sectionId()));
        }

        Task task = Task.builder()
                .title(request.title())
                .description(request.description())
                .priority(request.priority())
                .dueDate(request.dueDate())
                .completed(false)
                .user(user)
                .section(section)
                .build();

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public TaskResponse updateTask(User user, Long id, TaskRequest request) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));

        Section section = null;
        if (request.sectionId() != null) {
            section = sectionRepository.findByIdAndUser(request.sectionId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Section", request.sectionId()));
        }

        task.setTitle(request.title());
        task.setDescription(request.description());
        task.setPriority(request.priority());
        task.setDueDate(request.dueDate());
        task.setSection(section);

        task = taskRepository.save(task);
        return toResponse(task);
    }

    @Transactional
    public void deleteTask(User user, Long id) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        taskRepository.delete(task);
    }

    @Transactional
    public TaskResponse toggleComplete(User user, Long id) {
        Task task = taskRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Task", id));
        task.setCompleted(!task.isCompleted());
        task = taskRepository.save(task);
        return toResponse(task);
    }

    private TaskResponse toResponse(Task task) {
        List<SubtaskResponse> subtaskResponses = task.getSubtasks().stream()
                .map(subtask -> new SubtaskResponse(subtask.getId(), subtask.getTitle(), subtask.isCompleted()))
                .collect(Collectors.toList());

        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getPriority(),
                task.getDueDate(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getSection() != null ? task.getSection().getId() : null,
                task.getSection() != null ? task.getSection().getName() : null,
                subtaskResponses
        );
    }
}
