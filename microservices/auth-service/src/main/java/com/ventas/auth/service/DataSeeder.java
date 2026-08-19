package com.ventas.auth.service;

import com.ventas.auth.entity.User;
import com.ventas.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createUser("admin@ventas.com", "Admin Demo", User.Role.ADMIN);
        createUser("vendedor@ventas.com", "Vendedor Demo", User.Role.USER);
    }

    private void createUser(String email, String fullName, User.Role role) {
        User user = userRepository.findByEmail(email).orElse(
            User.builder().email(email).fullName(fullName).role(role).build()
        );
        if (user.getPassword() == null || !passwordEncoder.matches("password123", user.getPassword())) {
            user.setPassword(passwordEncoder.encode("password123"));
            userRepository.save(user);
            log.info("Usuario creado/actualizado: {}", email);
        }
    }
}
