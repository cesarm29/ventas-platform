package com.ventas.auth.service;

import com.ventas.auth.dto.*;
import com.ventas.auth.entity.User;
import com.ventas.auth.repository.UserRepository;
import com.ventas.auth.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthService implements UserDetailsService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + email));
        return new org.springframework.security.core.userdetails.User(
            user.getEmail(), user.getPassword(), user.isActive(), true, true, true,
            List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
        );
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
            .orElseThrow(() -> new RuntimeException("Credenciales invalidas"));
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new RuntimeException("Credenciales invalidas");
        }
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        log.info("Login exitoso: {}", user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name(), 86400000L);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("El email ya esta registrado: " + request.email());
        }
        User user = User.builder()
            .fullName(request.fullName())
            .email(request.email())
            .password(passwordEncoder.encode(request.password()))
            .role(User.Role.USER)
            .build();
        userRepository.save(user);
        String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
        log.info("Registro exitoso: {}", user.getEmail());
        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole().name(), 86400000L);
    }
}
