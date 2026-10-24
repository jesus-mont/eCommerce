package com.eCommerce.api.product.dto;

import com.eCommerce.api.product.domain.ProductCategory;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CreateProductRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("validate correct values")
    void validation_Success() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "SKU-001",
                "Laptop Gamer",
                "High performance laptop",
                ProductCategory.ELECTRONICS,
                new BigDecimal("1500.00"),
                10,
                new BigDecimal("2.500")
        );

        // Act
        Set<ConstraintViolation<CreateProductRequest>> violations = validator.validate(request);

        // Assert
        assertTrue(violations.isEmpty(), "No debería haber errores de validación");
    }

    @Test
    @DisplayName("fail when required fields are null or empty")
    void validation_BlankFields_ShouldFail() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "",
                "   ",
                null,
        null,
                null,
                null,
                null
        );

        // Act
        Set<ConstraintViolation<CreateProductRequest>> violations = validator.validate(request);

        // Assert
        assertFalse(violations.isEmpty());
        assertEquals(6, violations.size());
    }

    @Test
    @DisplayName("fail when values of stock or price are incorrect")
    void validation_InvalidNumberValues_ShouldFail() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "SKU-001",
                "Laptop",
                "Desc",
                null,
                new BigDecimal("0.00"),
                -5,
                new BigDecimal("0.000")
        );

        // Act
        Set<ConstraintViolation<CreateProductRequest>> violations = validator.validate(request);

        // Assert
        assertFalse(violations.isEmpty());
        assertEquals(4, violations.size());
    }
}