
package com.skillbridge.backend.controller;

import com.skillbridge.backend.dto.RegisterRequest;
import com.skillbridge.backend.entity.User;
import com.skillbridge.backend.repository.UserRepository;
import com.skillbridge.backend.service.JwtService;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // REGISTER API
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "message",
                            "Email already registered"
                    ));
        }

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword())
        );

        User savedUser = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Registration successful",
                        "id", savedUser.getId(),
                        "name", savedUser.getName(),
                        "email", savedUser.getEmail()
                ));
    }

    // LOGIN API
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody RegisterRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElse(null);

        if (user == null ||
                !passwordEncoder.matches(
                        request.getPassword(),
                        user.getPassword())) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of(
                            "message",
                            "Invalid email or password"
                    ));
        }

        // Generate JWT token after successful login
        String token = jwtService.generateToken(
                user.getId(),
                user.getEmail()
        );

        return ResponseEntity.ok(
                Map.of(
                        "message", "Login successful",
                        "id", user.getId(),
                        "name", user.getName(),
                        "email", user.getEmail(),
                        "token", token
                )
        );
    }
}
