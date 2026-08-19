package com.ventasplatform.config;

import com.ventasplatform.entity.User;
import com.ventasplatform.repository.UserRepository;
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
        seedUser("admin@ventas.com", "password123", "Administrador", User.Role.ADMIN);
        seedUser("vendedor@ventas.com", "password123", "Vendedor Demo", User.Role.USER);
    }

    private void seedUser(String email, String password, String fullName, User.Role role) {
        if (userRepository.existsByEmail(email)) {
            User user = userRepository.findByEmail(email).get();
            if (!passwordEncoder.matches(password, user.getPassword())) {
                user.setPassword(passwordEncoder.encode(password));
                userRepository.save(user);
                log.info("Updated password for: {}", email);
            }
            return;
        }
        User user = User.builder()
            .email(email)
            .password(passwordEncoder.encode(password))
            .fullName(fullName)
            .role(role)
            .build();
        userRepository.save(user);
        log.info("Created user: {}", email);
    }
}
