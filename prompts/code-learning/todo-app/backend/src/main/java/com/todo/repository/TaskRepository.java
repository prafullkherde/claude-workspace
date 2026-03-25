package com.todo.repository;

import com.todo.model.Section;
import com.todo.model.Task;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByUserAndSection(User user, Section section);
    List<Task> findByUser(User user);
    long countByUserAndCompleted(User user, boolean completed);
    Optional<Task> findByIdAndUser(Long id, User user);
}
