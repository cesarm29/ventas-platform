package com.ventasplatform;

import com.ventasplatform.dto.*;
import com.ventasplatform.entity.User;
import com.ventasplatform.repository.UserRepository;
import com.ventasplatform.security.JwtTokenProvider;
import com.ventasplatform.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider jwtTokenProvider;
    @InjectMocks private AuthService authService;

    private User testUser;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L).email("admin@ventas.com").password("$2a$10$encoded")
            .fullName("Admin").role(User.Role.ADMIN).active(true).build();
    }

    @Test
    @DisplayName("Login exitoso")
    void loginSuccess() {
        LoginRequest request = new LoginRequest("admin@ventas.com", "password123");
        given(userRepository.findByEmail("admin@ventas.com")).willReturn(Optional.of(testUser));
        given(passwordEncoder.matches("password123", testUser.getPassword())).willReturn(true);
        given(jwtTokenProvider.generateToken("admin@ventas.com", "ADMIN")).willReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertThat(response.token()).isEqualTo("jwt-token");
        assertThat(response.email()).isEqualTo("admin@ventas.com");
        assertThat(response.role()).isEqualTo("ADMIN");
    }

    @Test
    @DisplayName("Login fallido - usuario no existe")
    void loginFail() {
        given(userRepository.findByEmail("noexiste@ventas.com")).willReturn(Optional.empty());

        assertThatThrownBy(() -> authService.login(
            new LoginRequest("noexiste@ventas.com", "password123")
        )).isInstanceOf(UsernameNotFoundException.class);
    }
}
