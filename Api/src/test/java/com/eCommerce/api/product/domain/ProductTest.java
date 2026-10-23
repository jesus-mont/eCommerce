package com.eCommerce.api.product.domain;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class ProductTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Validate correct product entity values and lifecycle callbacks")
    void productEntity_Success() {
        Product product = Product.builder()
                .sku("SKU-001")
                .name("Laptop")
                .description("Gaming laptop")
                .category("ELECTRONICS")
                .price(new BigDecimal("1200.00"))
                .stock(10)
                .weightKg(new BigDecimal("2.500"))
                .isActive(true)
                .build();

        product.onCreate();

        Set<ConstraintViolation<Product>> violations = validator.validate(product);

        assertTrue(violations.isEmpty());
        assertNotNull(product.getCreatedAt());
        assertNotNull(product.getUpdatedAt());
        assertTrue(product.getIsActive());
    }

    @Test
    @DisplayName("Fail when required entity fields are blank or null")
    void productEntity_BlankFields_ShouldFail() {
        Product product = Product.builder()
                .sku("")
                .name("   ")
                .category(null)
                .price(null)
                .stock(null)
                .weightKg(null)
                .build();

        Set<ConstraintViolation<Product>> violations = validator.validate(product);

        assertFalse(violations.isEmpty());
        assertEquals(6, violations.size());
    }

    @Test
    @DisplayName("Update lifecycle callback should modify updatedAt timestamp")
    void productEntity_OnUpdateCallback() {
        Product product = Product.builder()
                .sku("SKU-001")
                .name("Laptop")
                .category("ELECTRONICS")
                .price(new BigDecimal("1200.00"))
                .stock(10)
                .weightKg(new BigDecimal("2.500"))
                .build();

        product.onCreate();
        OffsetDateTime initialUpdatedAt = product.getUpdatedAt();

        product.onUpdate();

        assertNotNull(product.getUpdatedAt());
        assertFalse(product.getUpdatedAt().isBefore(initialUpdatedAt));
    }
}