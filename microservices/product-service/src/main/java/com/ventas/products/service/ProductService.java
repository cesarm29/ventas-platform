package com.ventas.products.service;

import com.ventas.products.dto.*;
import com.ventas.products.entity.Product;
import com.ventas.products.kafka.ProductEventProducer;
import com.ventas.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProductService {

    private static final Logger log = LoggerFactory.getLogger(ProductService.class);
    private final ProductRepository productRepository;
    private final ProductEventProducer eventProducer;

    public ApiResponse<java.util.List<ProductDTO>> getProducts(int page, int size, String search, String category) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Product> productPage;

        if (search != null && !search.isBlank()) {
            productPage = productRepository.searchProducts(search, pageable);
        } else if (category != null && !category.isBlank()) {
            productPage = productRepository.findByActiveTrueAndCategory(category, pageable);
        } else {
            productPage = productRepository.findByActiveTrue(pageable);
        }

        var products = productPage.getContent().stream().map(this::toDTO).toList();
        var pageInfo = new ApiResponse.PageInfo(
            productPage.getNumber(), productPage.getSize(),
            productPage.getTotalElements(), productPage.getTotalPages()
        );
        return ApiResponse.ok(products, pageInfo);
    }

    public ProductDTO getProductById(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        return toDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = Product.builder()
            .name(dto.name()).description(dto.description()).category(dto.category())
            .price(dto.price()).stock(dto.stock() != null ? dto.stock() : 0).active(true)
            .build();
        Product saved = productRepository.save(product);
        eventProducer.sendProductEvent("CREATED", toDTO(saved));
        log.info("Producto creado: {}", saved.getName());
        return toDTO(saved);
    }

    @Transactional
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        product.setName(dto.name());
        product.setDescription(dto.description());
        product.setCategory(dto.category());
        product.setPrice(dto.price());
        product.setStock(dto.stock());
        product.setActive(dto.active());
        Product updated = productRepository.save(product);
        eventProducer.sendProductEvent("UPDATED", toDTO(updated));
        return toDTO(updated);
    }

    @Transactional
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + id));
        product.setActive(false);
        productRepository.save(product);
        eventProducer.sendProductEvent("DELETED", toDTO(product));
    }

    public ApiResponse<Map<String, Object>> getStats() {
        long totalProducts = productRepository.countByActiveTrue();
        return ApiResponse.ok(Map.of("totalProducts", totalProducts));
    }

    private ProductDTO toDTO(Product p) {
        return new ProductDTO(p.getId(), p.getName(), p.getDescription(), p.getCategory(),
            p.getPrice(), p.getStock(), p.isActive());
    }
}
