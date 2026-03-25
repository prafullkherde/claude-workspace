package com.todo.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.todo.dto.task.TaskRequest;
import com.todo.dto.task.TaskResponse;
import com.todo.model.Priority;
import com.todo.model.User;
import com.todo.security.JwtAuthFilter;
import com.todo.security.JwtUtil;
import com.todo.service.TaskService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.http.MediaType;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(
        controllers = TaskController.class,
        excludeFilters = @ComponentScan.Filter(
                type = FilterType.ASSIGNABLE_TYPE,
                classes = {JwtAuthFilter.class}
        )
)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private UserDetailsService userDetailsService;

    private User testUser;
    private TaskResponse taskResponse;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
                .id(1L)
                .name("Test User")
                .email("test@example.com")
                .password("encoded-password")
                .createdAt(LocalDateTime.now())
                .build();

        taskResponse = new TaskResponse(
                1L,
                "Test Task",
                "Test Description",
                Priority.HIGH,
                LocalDate.now().plusDays(7),
                false,
                LocalDateTime.now(),
                1L,
                "Personal",
                new ArrayList<>()
        );
    }

    @Test
    @DisplayName("GET /api/tasks - should return list of tasks for authenticated user")
    @WithMockUser(username = "test@example.com")
    void getTasks_AuthenticatedUser_ReturnsTaskList() throws Exception {
        when(taskService.getTasks(any(User.class), eq(null))).thenReturn(List.of(taskResponse));

        mockMvc.perform(get("/api/tasks")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].title").value("Test Task"))
                .andExpect(jsonPath("$[0].priority").value("HIGH"));
    }

    @Test
    @DisplayName("GET /api/tasks?sectionId=1 - should return tasks filtered by section")
    @WithMockUser(username = "test@example.com")
    void getTasks_BySectionId_ReturnsFilteredTasks() throws Exception {
        when(taskService.getTasks(any(User.class), eq(1L))).thenReturn(List.of(taskResponse));

        mockMvc.perform(get("/api/tasks?sectionId=1")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].sectionId").value(1));
    }

    @Test
    @DisplayName("POST /api/tasks - should create new task successfully")
    @WithMockUser(username = "test@example.com")
    void createTask_ValidRequest_ReturnsCreatedTask() throws Exception {
        TaskRequest request = new TaskRequest(
                "New Task",
                "New Description",
                Priority.MEDIUM,
                LocalDate.now().plusDays(3),
                1L
        );

        TaskResponse createdResponse = new TaskResponse(
                2L,
                "New Task",
                "New Description",
                Priority.MEDIUM,
                LocalDate.now().plusDays(3),
                false,
                LocalDateTime.now(),
                1L,
                "Personal",
                new ArrayList<>()
        );

        when(taskService.createTask(any(User.class), any(TaskRequest.class))).thenReturn(createdResponse);

        mockMvc.perform(post("/api/tasks")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(2))
                .andExpect(jsonPath("$.title").value("New Task"))
                .andExpect(jsonPath("$.priority").value("MEDIUM"));
    }

    @Test
    @DisplayName("POST /api/tasks - should return 400 when title is blank")
    @WithMockUser(username = "test@example.com")
    void createTask_BlankTitle_ReturnsBadRequest() throws Exception {
        TaskRequest invalidRequest = new TaskRequest(
                "",
                "Description",
                Priority.LOW,
                null,
                null
        );

        mockMvc.perform(post("/api/tasks")
                        .with(user(testUser))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("GET /api/tasks - should return 403 when not authenticated")
    void getTasks_Unauthenticated_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}
