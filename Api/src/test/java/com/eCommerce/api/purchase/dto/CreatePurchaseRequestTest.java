package com.eCommerce.api.purchase.dto;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class CreatePurchaseRequestTest {

    private static Validator validator;

    @BeforeAll
    static void setUpValidator() {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }
    }

    @Test
    @DisplayName("Should validate successfully when request is valid")
    void testValidCreatePurchaseRequest() {
        // Arrange
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(1L, 2);
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(itemReq));

        // Act
        Set<ConstraintViolation<CreatePurchaseRequest>> violations = validator.validate(request);

        // Assert
        assertTrue(violations.isEmpty(), "There should be no validation errors");
    }

    @Test
    @DisplayName("Should fail validation when email is blank or invalid")
    void testInvalidEmail() {
        // Arrange:
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(1L, 2);
        CreatePurchaseRequest requestBlank = new CreatePurchaseRequest("", List.of(itemReq));
        CreatePurchaseRequest requestInvalid = new CreatePurchaseRequest("correo-malformado", List.of(itemReq));

        // Act
        Set<ConstraintViolation<CreatePurchaseRequest>> violationsBlank = validator.validate(requestBlank);
        Set<ConstraintViolation<CreatePurchaseRequest>> violationsInvalid = validator.validate(requestInvalid);

        // Assert
        assertFalse(violationsBlank.isEmpty());
        assertFalse(violationsInvalid.isEmpty());
    }

    @Test
    @DisplayName("Should fail validation when items list is empty")
    void testEmptyItemsList() {
        // Arrange
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of());

        // Act
        Set<ConstraintViolation<CreatePurchaseRequest>> violations = validator.validate(request);

        // Assert
        assertFalse(violations.isEmpty());
        assertEquals(1, violations.size());
        assertEquals("Purchase must contain at least one item", violations.iterator().next().getMessage());
    }

    @Test
    @DisplayName("Should fail validation when item fields are null or quantity is not positive")
    void testInvalidItemRequest() {
        // Arrange:
        CreatePurchaseRequest.ItemRequest invalidItem = new CreatePurchaseRequest.ItemRequest(null, 0);
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(invalidItem));

        // Act
        Set<ConstraintViolation<CreatePurchaseRequest>> violations = validator.validate(request);

        // Assert
        assertFalse(violations.isEmpty());
        assertEquals(2, violations.size());
    }
}