package com.todo.service;

import com.todo.dto.task.TaskRequest;
import com.todo.dto.task.TaskResponse;
import com.todo.exception.ResourceNotFoundException;
import com.todo.model.Priority;
import com.todo.model.Section;
import com.todo.model.Task;
import com.todo.model.User;
import com.todo.repository.SectionRepository;
import com.todo.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private SectionRepository sectionRepository;

    @InjectMocks
    private TaskService taskService;

    private User testUser;
    private Section testSection;
    private Task testTask;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-password")
                .createdAt(LocalDateTime.now())
                .build();

        testSection = Section.builder()
                .id(1L)
                .name("Personal")
                .isDefault(true)
                .user(testUser)
                .tasks(new ArrayList<>())
                .build();

        testTask = Task.builder()
                .id(1L)
                .title("Test Task")
                .description("Test Description")
                .priority(Priority.HIGH)
                .dueDate(LocalDate.now().plusDays(7))
                .completed(false)
                .createdAt(LocalDateTime.now())
                .user(testUser)
                .section(testSection)
                .subtasks(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("createTask - should create task successfully with section")
    void createTask_WithSection_Success() {
        TaskRequest request = new TaskRequest(
                "New Task",
                "New Description",
                Priority.MEDIUM,
                LocalDate.now().plusDays(3),
                1L
        );

        when(sectionRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testSection));
        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            t = Task.builder()
                    .id(2L)
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .priority(t.getPriority())
                    .dueDate(t.getDueDate())
                    .completed(false)
                    .createdAt(LocalDateTime.now())
                    .user(testUser)
                    .section(testSection)
                    .subtasks(new ArrayList<>())
                    .build();
            return t;
        });

        TaskResponse response = taskService.createTask(testUser, request);

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("New Task");
        assertThat(response.priority()).isEqualTo(Priority.MEDIUM);
        assertThat(response.sectionId()).isEqualTo(1L);
        assertThat(response.completed()).isFalse();

        verify(sectionRepository).findByIdAndUser(1L, testUser);
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("createTask - should create task without section")
    void createTask_WithoutSection_Success() {
        TaskRequest request = new TaskRequest(
                "Task Without Section",
                null,
                Priority.LOW,
                null,
                null
        );

        when(taskRepository.save(any(Task.class))).thenAnswer(invocation -> {
            Task t = invocation.getArgument(0);
            return Task.builder()
                    .id(3L)
                    .title(t.getTitle())
                    .description(t.getDescription())
                    .priority(t.getPriority())
                    .dueDate(t.getDueDate())
                    .completed(false)
                    .createdAt(LocalDateTime.now())
                    .user(testUser)
                    .section(null)
                    .subtasks(new ArrayList<>())
                    .build();
        });

        TaskResponse response = taskService.createTask(testUser, request);

        assertThat(response).isNotNull();
        assertThat(response.title()).isEqualTo("Task Without Section");
        assertThat(response.sectionId()).isNull();

        verify(sectionRepository, never()).findByIdAndUser(any(), any());
        verify(taskRepository).save(any(Task.class));
    }

    @Test
    @DisplayName("updateTask - should update task successfully")
    void updateTask_Success() {
        TaskRequest request = new TaskRequest(
                "Updated Title",
                "Updated Description",
                Priority.URGENT,
                LocalDate.now().plusDays(1),
                1L
        );

        when(taskRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testTask));
        when(sectionRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testSection));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        TaskResponse response = taskService.updateTask(testUser, 1L, request);

        assertThat(response).isNotNull();
        verify(taskRepository).findByIdAndUser(1L, testUser);
        verify(taskRepository).save(testTask);
    }

    @Test
    @DisplayName("updateTask - should throw exception when task not found")
    void updateTask_TaskNotFound_ThrowsException() {
        TaskRequest request = new TaskRequest("Title", null, Priority.LOW, null, null);

        when(taskRepository.findByIdAndUser(99L, testUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.updateTask(testUser, 99L, request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("deleteTask - should delete task successfully")
    void deleteTask_Success() {
        when(taskRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testTask));
        doNothing().when(taskRepository).delete(testTask);

        taskService.deleteTask(testUser, 1L);

        verify(taskRepository).findByIdAndUser(1L, testUser);
        verify(taskRepository).delete(testTask);
    }

    @Test
    @DisplayName("deleteTask - should throw exception when task not found")
    void deleteTask_NotFound_ThrowsException() {
        when(taskRepository.findByIdAndUser(99L, testUser)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(testUser, 99L))
                .isInstanceOf(ResourceNotFoundException.class);

        verify(taskRepository, never()).delete(any());
    }

    @Test
    @DisplayName("getTasks - should return tasks filtered by section")
    void getTasks_BySection_Success() {
        when(sectionRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testSection));
        when(taskRepository.findByUserAndSection(testUser, testSection)).thenReturn(List.of(testTask));

        List<TaskResponse> tasks = taskService.getTasks(testUser, 1L);

        assertThat(tasks).hasSize(1);
        assertThat(tasks.get(0).title()).isEqualTo("Test Task");
    }

    @Test
    @DisplayName("toggleComplete - should toggle task completion status")
    void toggleComplete_Success() {
        when(taskRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testTask));
        when(taskRepository.save(any(Task.class))).thenReturn(testTask);

        taskService.toggleComplete(testUser, 1L);

        assertThat(testTask.isCompleted()).isTrue();
        verify(taskRepository).save(testTask);
    }
}
