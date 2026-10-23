package com.eCommerce.api.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlobalExceptionHandlerTest {

    @InjectMocks
    private GlobalExceptionHandler exceptionHandler;

    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/test");
    }

    @Test
    @DisplayName("Should handle MethodArgumentNotValidException and return 400 Bad Request")
    void handleValidationExceptions_Success() {
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);
        FieldError fieldError = new FieldError("object", "field", "must not be blank");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError));

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleValidationExceptions(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(400, response.getBody().getStatus());
        assertEquals("Validation failed for one or more fields", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
        assertTrue(response.getBody().getValidationErrors().containsKey("field"));
    }

    @Test
    @DisplayName("Should handle DuplicateResourceException and return 409 Conflict")
    void handleDuplicateResourceException_Success() {
        DuplicateResourceException ex = new DuplicateResourceException("Resource already exists");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleDuplicateResourceException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(409, response.getBody().getStatus());
        assertEquals("Resource already exists", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    @DisplayName("Should handle ResourceNotFoundException and return 404 Not Found")
    void handleResourceNotFoundException_Success() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Resource not found");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleResourceNotFoundException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(404, response.getBody().getStatus());
        assertEquals("Resource not found", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }

    @Test
    @DisplayName("Should handle generic Exception and return 500 Internal Server Error")
    void handleGlobalException_Success() {
        Exception ex = new Exception("Unexpected error");

        ResponseEntity<ErrorResponse> response = exceptionHandler.handleGlobalException(ex, request);

        assertNotNull(response);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(500, response.getBody().getStatus());
        assertEquals("An unexpected error occurred: Unexpected error", response.getBody().getMessage());
        assertEquals("/api/test", response.getBody().getPath());
    }
}