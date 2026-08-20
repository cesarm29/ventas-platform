package com.ventas.orders.client;

import com.ventas.orders.dto.ApiResponse;
import com.ventas.orders.dto.ProductDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class ProductClient {

    private static final Logger log = LoggerFactory.getLogger(ProductClient.class);
    private final RestTemplate restTemplate;
    private final String productServiceUrl;

    public ProductClient(RestTemplate restTemplate,
                         @Value("${product-service.url:http://localhost:8082}") String productServiceUrl) {
        this.restTemplate = restTemplate;
        this.productServiceUrl = productServiceUrl;
        log.info("ProductClient initialized with URL: {}", productServiceUrl);
    }

    public ProductDTO getProduct(Long productId) {
        try {
            String url = productServiceUrl + "/api/products/" + productId;
            log.info("Calling product-service: {}", url);
            ApiResponse<ProductDTO> response = restTemplate.getForObject(url, ApiResponse.class);
            if (response != null && response.data() != null) {
                return response.data();
            }
            throw new RuntimeException("Producto no encontrado: " + productId);
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            log.error("Error calling product-service at {}/api/products/{}: {}", productServiceUrl, productId, e.getMessage(), e);
            throw new RuntimeException("Producto no encontrado: " + productId, e);
        }
    }
}
