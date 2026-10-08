package com.florascan.service;

import com.florascan.dto.AuthRequest;
import com.florascan.dto.AuthResponse;
import com.florascan.dto.RegisterRequest;
import com.florascan.entity.UserEntity;
import com.florascan.repository.UserRepository;
import com.florascan.security.JwtUtils;
import org.springframework.stereotype.Service;

import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;

    public AuthService(UserRepository userRepository, JwtUtils jwtUtils) {
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
    }

    public AuthResponse register(RegisterRequest req) {
        if (req.getEmail() == null || req.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (req.getPassword() == null || req.getPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }
        if (userRepository.existsByEmail(req.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email address already exists.");
        }

        String hashedPassword = hashPassword(req.getPassword());
        UserEntity user = UserEntity.builder()
                .email(req.getEmail().toLowerCase().trim())
                .password(hashedPassword)
                .fullName(req.getFullName() != null ? req.getFullName().trim() : "Farmer")
                .farmName(req.getFarmName())
                .role(req.getRole() != null ? req.getRole() : "farmer")
                .build();

        user = userRepository.save(user);
        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .farmName(user.getFarmName())
                .role(user.getRole())
                .message("Registration successful!")
                .build();
    }

    public AuthResponse login(AuthRequest req) {
        if (req.getEmail() == null || req.getPassword() == null) {
            throw new IllegalArgumentException("Email and password are required.");
        }

        Optional<UserEntity> userOpt = userRepository.findByEmail(req.getEmail().toLowerCase().trim());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        UserEntity user = userOpt.get();
        String hashedInput = hashPassword(req.getPassword());
        if (!user.getPassword().equals(hashedInput)) {
            throw new IllegalArgumentException("Invalid email or password.");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .farmName(user.getFarmName())
                .role(user.getRole())
                .message("Login successful.")
                .build();
    }

    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    private String hashPassword(String password) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(password.getBytes());
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            return password;
        }
    }
}
