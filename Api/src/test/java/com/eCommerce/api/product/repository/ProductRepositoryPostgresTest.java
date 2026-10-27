package com.eCommerce.api.product.repository;

import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.domain.ProductCategory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
class ProductRepositoryPostgresTest {
    @Container
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void databaseProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    @Autowired ProductRepository productRepository;

    @BeforeEach
    void cleanProducts() {
        productRepository.deleteAll();
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void onlyOneConcurrentReservationCanConsumeTheLastUnit() throws Exception {
        Product product = productRepository.save(Product.builder()
                .sku("LAST-UNIT")
                .name("Café Keyboard")
                .description("Wireless keyboard")
                .category(ProductCategory.ELECTRONICS)
                .price(new BigDecimal("10.00"))
                .stock(1)
                .weightKg(new BigDecimal("1.000"))
                .isActive(true)
                .build());

        CountDownLatch start = new CountDownLatch(1);
        var executor = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> first = executor.submit(() -> {
                start.await();
                return productRepository.reserveStock(product.getId(), 1);
            });
            Future<Integer> second = executor.submit(() -> {
                start.await();
                return productRepository.reserveStock(product.getId(), 1);
            });
            start.countDown();
            assertEquals(1, first.get() + second.get());
            assertEquals(0, productRepository.findById(product.getId()).orElseThrow().getStock());
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    void searchMatchesAccentsAndTreatsWildcardsLiterally() {
        Product cafe = productRepository.save(Product.builder()
                .sku("CAFE-1").name("Café Keyboard").description("Wireless keyboard")
                .category(ProductCategory.ELECTRONICS).price(new BigDecimal("10.00"))
                .stock(1).weightKg(new BigDecimal("1.000")).isActive(true).build());
        productRepository.save(Product.builder()
                .sku("PERCENT-1").name("100% Cotton Shirt").description("shirt")
                .category(ProductCategory.CLOTHING).price(new BigDecimal("10.00"))
                .stock(1).weightKg(new BigDecimal("1.000")).isActive(true).build());

        assertEquals(cafe.getId(), productRepository.searchProducts("cafe", org.springframework.data.domain.PageRequest.of(0, 10))
                .getContent().get(0).getId());
        assertEquals(1, productRepository.searchProducts("keyboard cafe", org.springframework.data.domain.PageRequest.of(0, 10))
                .getTotalElements());
        assertEquals(1, productRepository.searchProducts("\\%", org.springframework.data.domain.PageRequest.of(0, 10)).getTotalElements());
    }
}
