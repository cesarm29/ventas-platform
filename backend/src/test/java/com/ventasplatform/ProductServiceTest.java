package com.ventasplatform.service;

import com.ventasplatform.dto.*;
import com.ventasplatform.entity.Product;
import com.ventasplatform.entity.User;
import com.ventasplatform.repository.ProductRepository;
import com.ventasplatform.repository.UserRepository;
import com.ventasplatform.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock private ProductRepository productRepository;
    @Mock private SimpMessagingTemplate messagingTemplate;
    @InjectMocks private ProductService productService;

    private Product testProduct;

    @BeforeEach
    void setUp() {
        testProduct = Product.builder()
            .id(1L).name("Laptop HP").description("Laptop 16GB")
            .category("Electronica").price(BigDecimal.valueOf(899.99))
            .stock(25).active(true).build();
    }

    @Test
    @DisplayName("Crear producto exitosamente")
    void createProduct() {
        given(productRepository.save(any(Product.class))).thenReturn(testProduct);
        ProductDTO dto = new ProductDTO(null, "Laptop HP", "Laptop 16GB", "Electronica", BigDecimal.valueOf(899.99), 25, true);

        ProductDTO result = productService.createProduct(dto);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Laptop HP");
        verify(messagingTemplate).convertAndSend(eq("/topic/products"), any());
    }

    @Test
    @DisplayName("Obtener producto por ID")
    void getProductById() {
        given(productRepository.findById(1L)).willReturn(Optional.of(testProduct));

        ProductDTO result = productService.getProductById(1L);

        assertThat(result.name()).isEqualTo("Laptop HP");
        assertThat(result.price()).isEqualByComparingTo(BigDecimal.valueOf(899.99));
    }

    @Test
    @DisplayName("Producto no encontrado lanza excepcion")
    void getProductNotFound() {
        given(productRepository.findById(999L)).willReturn(Optional.empty());
        assertThatThrownBy(() -> productService.getProductById(999L))
            .isInstanceOf(RuntimeException.class);
    }
}
