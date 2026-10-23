package com.eCommerce.api.purchase.controller;

import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;
import com.eCommerce.api.purchase.service.PurchaseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PurchaseController.class)
class PurchaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PurchaseService purchaseService;

    @Test
    @DisplayName("Should create purchase successfully and return 201 Created")
    void createPurchase_Success() throws Exception {
        // Arrange
        CreatePurchaseRequest request = new CreatePurchaseRequest(
                "cliente@example.com",
                List.of(new CreatePurchaseRequest.ItemRequest(1L, 2))
        );

        PurchaseResponse mockResponse = new PurchaseResponse(
                1L,
                "cliente@example.com",
                OrderStatus.PENDING,
                BigDecimal.valueOf(200.00),
                List.of(new PurchaseResponse.ItemResponse(1L, "SKU-001", 2, BigDecimal.valueOf(100.00))),
                OffsetDateTime.now()
        );

        when(purchaseService.createPurchase(any(CreatePurchaseRequest.class))).thenReturn(mockResponse);

        // Act & Assert
        mockMvc.perform(post("/api/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.customerEmail").value("cliente@example.com"))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.totalAmount").value(200.00))
                .andExpect(jsonPath("$.items[0].productId").value(1L))
                .andExpect(jsonPath("$.items[0].quantity").value(2));
    }

    @Test
    @DisplayName("Should return 400 Bad Request when request is invalid")
    void createPurchase_BadRequest() throws Exception {
        // Arrange: Email inválido y lista vacía para disparar las validaciones @Valid
        CreatePurchaseRequest invalidRequest = new CreatePurchaseRequest(
                "correo-invalido",
                List.of()
        );

        // Act & Assert
        mockMvc.perform(post("/api/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest());
    }
}
