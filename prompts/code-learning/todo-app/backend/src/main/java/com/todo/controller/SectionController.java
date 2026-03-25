package com.todo.controller;

import com.todo.dto.section.SectionRequest;
import com.todo.dto.section.SectionResponse;
import com.todo.model.User;
import com.todo.service.SectionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sections")
@RequiredArgsConstructor
public class SectionController {

    private final SectionService sectionService;

    @GetMapping
    public ResponseEntity<List<SectionResponse>> getSections(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(sectionService.getSections(user));
    }

    @PostMapping
    public ResponseEntity<SectionResponse> createSection(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody SectionRequest request
    ) {
        SectionResponse response = sectionService.createSection(user, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(
            @AuthenticationPrincipal User user,
            @PathVariable Long id
    ) {
        sectionService.deleteSection(user, id);
        return ResponseEntity.noContent().build();
    }
}
