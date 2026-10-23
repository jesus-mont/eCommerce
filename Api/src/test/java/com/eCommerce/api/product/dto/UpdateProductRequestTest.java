package com.eCommerce.api.product.dto;

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

class UpdateProductRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    @DisplayName("Should pass validation when all fields are valid")
    void validation_Success() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Laptop",
                "Updated description",
                "ELECTRONICS",
                new BigDecimal("1300.00"),
                15,
                new BigDecimal("2.200")
        );

        Set<ConstraintViolation<UpdateProductRequest>> violations = validator.validate(request);

        assertTrue(violations.isEmpty());
    }

    @Test
    @DisplayName("Should fail validation when required fields are blank or null")
    void validation_BlankFields_ShouldFail() {
        UpdateProductRequest request = new UpdateProductRequest(
                "",
                null,
                "   ",
                null,
                null,
                null
        );

        Set<ConstraintViolation<UpdateProductRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertEquals(5, violations.size());
    }

    @Test
    @DisplayName("Should fail validation when numerical fields have invalid values")
    void validation_InvalidNumberValues_ShouldFail() {
        UpdateProductRequest request = new UpdateProductRequest(
                "Laptop",
                "Desc",
                "ELECTRONICS",
                new BigDecimal("0.00"),
                -1,
                new BigDecimal("0.000")
        );

        Set<ConstraintViolation<UpdateProductRequest>> violations = validator.validate(request);

        assertFalse(violations.isEmpty());
        assertEquals(3, violations.size());
    }
}