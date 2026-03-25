package com.todo.service;

import com.todo.dto.auth.AuthResponse;
import com.todo.dto.auth.LoginRequest;
import com.todo.dto.auth.RegisterRequest;
import com.todo.model.Section;
import com.todo.model.User;
import com.todo.repository.SectionRepository;
import com.todo.repository.UserRepository;
import com.todo.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final SectionRepository sectionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .build();

        user = userRepository.save(user);

        // Seed default sections
        seedDefaultSections(user);

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getEmail());
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user);
        return new AuthResponse(token, user.getName(), user.getEmail());
    }

    private void seedDefaultSections(User user) {
        List<String> defaultSectionNames = List.of("Family", "Office", "Personal");

        for (String name : defaultSectionNames) {
            Section section = Section.builder()
                    .name(name)
                    .isDefault(true)
                    .user(user)
                    .build();
            sectionRepository.save(section);
        }
    }
}
