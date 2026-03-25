package com.todo.service;

import com.todo.dto.section.SectionRequest;
import com.todo.dto.section.SectionResponse;
import com.todo.exception.ResourceNotFoundException;
import com.todo.model.Section;
import com.todo.model.User;
import com.todo.repository.SectionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SectionService {

    private final SectionRepository sectionRepository;

    @Transactional(readOnly = true)
    public List<SectionResponse> getSections(User user) {
        return sectionRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public SectionResponse createSection(User user, SectionRequest request) {
        Section section = Section.builder()
                .name(request.name())
                .isDefault(false)
                .user(user)
                .build();

        section = sectionRepository.save(section);
        return toResponse(section);
    }

    @Transactional
    public void deleteSection(User user, Long id) {
        Section section = sectionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Section", id));

        if (section.isDefault()) {
            throw new IllegalArgumentException("Cannot delete a default section");
        }

        sectionRepository.delete(section);
    }

    private SectionResponse toResponse(Section section) {
        long taskCount = section.getTasks().stream()
                .filter(task -> !task.isCompleted())
                .count();

        return new SectionResponse(
                section.getId(),
                section.getName(),
                section.isDefault(),
                taskCount
        );
    }
}
