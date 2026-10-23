package com.eCommerce.api.product.controller;

import com.eCommerce.api.common.exception.DuplicateResourceException;
import com.eCommerce.api.common.exception.ResourceNotFoundException;
import com.eCommerce.api.product.dto.CreateProductRequest;
import com.eCommerce.api.product.dto.ProductResponse;
import com.eCommerce.api.product.dto.UpdateProductRequest;
import com.eCommerce.api.product.service.ProductService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ProductService productService;

    @Test
    @DisplayName("POST /api/products - Debe retornar 201 Created cuando el producto es válido")
    void createProduct_Success() throws Exception {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "SKU-001", "Laptop", "Gaming Laptop", "ELECTRONICS",
                new BigDecimal("1200.00"), 10, BigDecimal.valueOf(2.5)
        );

        ProductResponse response = new ProductResponse(
                1L, "SKU-001", "Laptop", "Gaming Laptop", "ELECTRONICS",
                new BigDecimal("1200.00"), 10, new BigDecimal("2.5"), true, OffsetDateTime.now(), OffsetDateTime.now()
        );

        given(productService.createProduct(any(CreateProductRequest.class))).willReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.sku").value("SKU-001"))
                .andExpect(jsonPath("$.name").value("Laptop"));
    }

    @Test
    @DisplayName("POST /api/products - Debe retornar 409 Conflict cuando el SKU ya existe")
    void createProduct_Conflict() throws Exception {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "SKU-001", "Laptop", "Gaming Laptop", "ELECTRONICS",
                new BigDecimal("1200.00"), 10,  BigDecimal.valueOf(2.5)
        );

        given(productService.createProduct(any(CreateProductRequest.class)))
                .willThrow(new DuplicateResourceException("Product with SKU SKU-001 already exists"));

        // Act & Assert
        mockMvc.perform(post("/api/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("Product with SKU SKU-001 already exists"));
    }

    @Test
    @DisplayName("GET /api/products/{id} - Debe retornar 200 OK cuando el producto existe")
    void getProductById_Success() throws Exception {
        // Arrange
        Long productId = 1L;
        ProductResponse response = new ProductResponse(
                productId, "SKU-001", "Laptop", "Gaming Laptop", "ELECTRONICS",
                new BigDecimal("1200.00"), 10, new BigDecimal("2.5"), true, OffsetDateTime.now(), OffsetDateTime.now()
        );

        given(productService.getProductById(productId)).willReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/products/{id}", productId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(productId))
                .andExpect(jsonPath("$.sku").value("SKU-001"));
    }

    @Test
    @DisplayName("GET /api/products/{id} - Debe retornar 404 Not Found cuando el producto no existe")
    void getProductById_NotFound() throws Exception {
        // Arrange
        Long productId = 99L;
        given(productService.getProductById(productId))
                .willThrow(new ResourceNotFoundException("Product not found with id: " + productId));

        // Act & Assert
        mockMvc.perform(get("/api/products/{id}", productId)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Product not found with id: 99"));
    }

    @Test
    @DisplayName("GET /api/products - Debe retornar 200 OK con una página de productos")
    void getAllProducts_Success() throws Exception {
        // Arrange
        ProductResponse response = new ProductResponse(
                1L, "SKU-001", "Laptop", "Gaming Laptop", "ELECTRONICS",
                new BigDecimal("1200.00"), 10, new BigDecimal("2.5"), true, OffsetDateTime.now(), OffsetDateTime.now()
        );

        PageImpl<ProductResponse> page = new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1);
        given(productService.getAllProducts(any())).willReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/products")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].sku").value("SKU-001"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    @DisplayName("PUT /api/products/{id} - Debe retornar 200 OK al actualizar exitosamente")
    void updateProduct_Success() throws Exception {
        // Arrange
        Long productId = 1L;
        UpdateProductRequest request = new UpdateProductRequest(
                "Updated Laptop", "New Description", "ELECTRONICS",
                new BigDecimal("1300.00"), 8, new BigDecimal(2.3)
        );

        ProductResponse response = new ProductResponse(
                productId, "SKU-001", "Updated Laptop", "New Description", "ELECTRONICS",
                new BigDecimal("1300.00"), 8, new BigDecimal(2.3), true, OffsetDateTime.now(), OffsetDateTime.now()
        );

        given(productService.updateProduct(eq(productId), any(UpdateProductRequest.class))).willReturn(response);

        // Act & Assert
        mockMvc.perform(put("/api/products/{id}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Updated Laptop"))
                .andExpect(jsonPath("$.price").value(1300.00));
    }

    @Test
    @DisplayName("DELETE /api/products/{id} - Debe retornar 204 No Content al desactivar exitosamente")
    void deactivateProduct_Success() throws Exception {
        // Arrange
        Long productId = 1L;

        // Act & Assert
        mockMvc.perform(delete("/api/products/{id}", productId))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("GET /api/products/search - Should return 200 OK with matching products")
    void searchProducts_Success() throws Exception {
        String keyword = "laptop";
        ProductResponse response = new ProductResponse(
                1L, "SKU-001", "Gaming Laptop", "Desc", "ELECTRONICS",
                new BigDecimal("1200.00"), 5, new BigDecimal("2.5"), true, null, null
        );

        PageImpl<ProductResponse> page = new PageImpl<>(List.of(response), PageRequest.of(0, 20), 1);
        given(productService.searchProducts(eq(keyword), any())).willReturn(page);

        mockMvc.perform(get("/api/products/search")
                        .param("q", keyword)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].name").value("Gaming Laptop"))
                .andExpect(jsonPath("$.totalElements").value(1));
    }
}
