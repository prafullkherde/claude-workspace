package com.todo.repository;

import com.todo.model.Section;
import com.todo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {
    List<Section> findByUser(User user);
    List<Section> findByUserAndIsDefault(User user, boolean isDefault);
    Optional<Section> findByIdAndUser(Long id, User user);
}
