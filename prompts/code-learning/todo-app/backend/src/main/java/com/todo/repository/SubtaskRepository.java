package com.todo.repository;

import com.todo.model.Subtask;
import com.todo.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubtaskRepository extends JpaRepository<Subtask, Long> {
    List<Subtask> findByTask(Task task);
    Optional<Subtask> findByIdAndTask(Long id, Task task);
}
