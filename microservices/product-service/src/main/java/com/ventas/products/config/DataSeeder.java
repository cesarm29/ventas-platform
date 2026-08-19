package com.ventas.products.config;

import com.ventas.products.entity.Product;
import com.ventas.products.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final ProductRepository productRepository;

    @Override
    public void run(String... args) {
        if (productRepository.count() == 0) {
            List<Product> products = List.of(
                Product.builder().name("Laptop HP ProBook").description("Laptop empresarial 14 pulgadas").category("Electronica").price(BigDecimal.valueOf(25000)).stock(15).active(true).build(),
                Product.builder().name("Mouse Logitech MX").description("Mouse inalambrico ergonomico").category("Accesorios").price(BigDecimal.valueOf(1200)).stock(50).active(true).build(),
                Product.builder().name("Teclado Mecanico RGB").description("Teclado mecanico switches blue").category("Accesorios").price(BigDecimal.valueOf(1800)).stock(30).active(true).build(),
                Product.builder().name("Monitor Samsung 27").description("Monitor IPS 4K 27 pulgadas").category("Electronica").price(BigDecimal.valueOf(8500)).stock(10).active(true).build(),
                Product.builder().name("Escritorio Ejecutivo").description("Escritorio de madera 120x60cm").category("Muebles").price(BigDecimal.valueOf(5500)).stock(8).active(true).build()
            );
            productRepository.saveAll(products);
            log.info("Productos demo creados: {}", products.size());
        }
    }
}
