package com.eCommerce.api.product.service;

import com.eCommerce.api.common.exception.DuplicateResourceException;
import com.eCommerce.api.common.exception.ResourceNotFoundException;
import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.domain.ProductCategory;
import com.eCommerce.api.product.dto.CreateProductRequest;
import com.eCommerce.api.product.dto.ProductResponse;
import com.eCommerce.api.product.dto.UpdateProductRequest;
import com.eCommerce.api.product.repository.ProductRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceImplTest {

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private ProductServiceImpl productService;

    @Test
    @DisplayName("should create the product successfully when sku doesn't exist")
    void createProduct_Success() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "sku-001", "  Laptop  ", "Gaming Laptop", ProductCategory.ELECTRONICS,
                new BigDecimal("1200.00"), 10, BigDecimal.valueOf(2.5)
        );

        when(productRepository.existsBySku("SKU-001")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product p = invocation.getArgument(0);
            p.setId(1L);
            return p;
        });

        // Act
        ProductResponse response = productService.createProduct(request);

        // Assert
        assertNotNull(response);
        assertEquals("SKU-001", response.sku());
        assertEquals("Laptop", response.name());
        verify(productRepository, times(1)).existsBySku("SKU-001");
        verify(productRepository, times(1)).save(any(Product.class));
    }

    @Test
    @DisplayName("throw DuplicateResourceException when sku already exist")
    void createProduct_ThrowsDuplicateException() {
        // Arrange
        CreateProductRequest request = new CreateProductRequest(
                "sku-001", "Laptop", "Gaming Laptop", ProductCategory.ELECTRONICS,
                new BigDecimal("1200.00"), 10, BigDecimal.valueOf(2.5)
        );

        when(productRepository.existsBySku("SKU-001")).thenReturn(true);

        // Act & Assert
        DuplicateResourceException exception = assertThrows(
                DuplicateResourceException.class,
                () -> productService.createProduct(request)
        );

        assertEquals("Product with SKU SKU-001 already exists", exception.getMessage());
        verify(productRepository, never()).save(any(Product.class));
    }

    @Test
    void createProduct_RejectsWhitespaceOnlyNameBeforePersistence() {
        CreateProductRequest request = new CreateProductRequest("sku", "   ", null,
                ProductCategory.MISC, new BigDecimal("1.00"), 0, new BigDecimal("1.000"));
        assertThrows(IllegalArgumentException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("return ProductResponse when id exist")
    void getProductById_Success() {
        // Arrange
        Long productId = 1L;
        Product product = Product.builder()
                .id(productId)
                .sku("SKU-001")
                .name("Laptop")
                .category(ProductCategory.ELECTRONICS)
                .price(BigDecimal.valueOf(1000))
                .stock(5)
                .isActive(true)
                .build();

        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.of(product));

        // Act
        ProductResponse response = productService.getProductById(productId);

        // Assert
        assertNotNull(response);
        assertEquals(productId, response.id());
        assertEquals("SKU-001", response.sku());
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("Throw ResourceNotFoundException when id doesn't exist")
    void getProductById_ThrowsNotFoundException() {
        // Arrange
        Long productId = 99L;
        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> productService.getProductById(productId)
        );

        assertEquals("Product not found with id: 99", exception.getMessage());
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("return paginated page of active products")
    void getAllProducts_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 10);
        Product product = Product.builder()
                .id(1L)
                .sku("SKU-001")
                .name("Laptop")
                .category(ProductCategory.ELECTRONICS)
                .price(BigDecimal.valueOf(1000))
                .stock(5)
                .isActive(true)
                .build();

        Page<Product> productPage = new PageImpl<>(List.of(product), pageable, 1);
        when(productRepository.findByIsActiveTrue(pageable)).thenReturn(productPage);

        // Act
        Page<ProductResponse> responsePage = productService.getAllProducts(pageable);

        // Assert
        assertNotNull(responsePage);
        assertEquals(1, responsePage.getTotalElements());
        assertEquals("SKU-001", responsePage.getContent().get(0).sku());
        verify(productRepository, times(1)).findByIsActiveTrue(pageable);
    }

    @Test
    @DisplayName("update product successfully")
    void updateProduct_Success() {
        // Arrange
        Long productId = 1L;
        Product existingProduct = Product.builder()
                .id(productId)
                .sku("SKU-001")
                .name("Old Name")
                .category(ProductCategory.PETS)
                .price(BigDecimal.valueOf(500))
                .stock(2)
                .isActive(true)
                .build();

        UpdateProductRequest request = new UpdateProductRequest(
                "  Updated Name  ", "New Description", ProductCategory.PETS,
                BigDecimal.valueOf(800), 15, BigDecimal.valueOf(1.2)
        );

        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.of(existingProduct));

        // Act
        ProductResponse response = productService.updateProduct(productId, request);

        // Assert
        assertNotNull(response);
        assertEquals("Updated Name", existingProduct.getName());
        assertEquals(ProductCategory.PETS, existingProduct.getCategory());
        assertEquals(BigDecimal.valueOf(800), existingProduct.getPrice());
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("throw ResourceNotFoundException when try to update a product that doesn't exist")
    void updateProduct_ThrowsNotFoundException() {
        // Arrange
        Long productId = 99L;
        UpdateProductRequest request = new UpdateProductRequest(
                "Name", "Desc", ProductCategory.PETS, BigDecimal.valueOf(100), 1, BigDecimal.valueOf(1.0)
        );

        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                ResourceNotFoundException.class,
                () -> productService.updateProduct(productId, request)
        );
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("change product isActive to false")
    void deactivateProduct_Success() {
        // Arrange
        Long productId = 1L;
        Product existingProduct = Product.builder()
                .id(productId)
                .sku("SKU-001")
                .isActive(true)
                .build();

        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.of(existingProduct));

        // Act
        productService.deactivateProduct(productId);

        // Assert
        assertFalse(existingProduct.getIsActive());
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("throw ResourceNotFoundException when try to deactivate a product doesn't exist")
    void deactivateProduct_ThrowsNotFoundException() {
        // Arrange
        Long productId = 99L;
        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(
                ResourceNotFoundException.class,
                () -> productService.deactivateProduct(productId)
        );
        verify(productRepository, times(1)).findByIdAndIsActiveTrue(productId);
    }

    @Test
    @DisplayName("Should return a paged list of products matching the search keyword")
    void searchProducts_Success() {
        Pageable pageable = PageRequest.of(0, 10, org.springframework.data.domain.Sort.by("createdAt"));
        Pageable relevancePage = PageRequest.of(0, 10);
        String keyword = "laptop";
        Product product = Product.builder()
                .id(1L)
                .sku("SKU-001")
                .name("Gaming Laptop")
                .category(ProductCategory.ELECTRONICS)
                .price(BigDecimal.valueOf(1200))
                .stock(5)
                .isActive(true)
                .build();

        Page<Product> productPage = new PageImpl<>(List.of(product), relevancePage, 1);
        when(productRepository.searchProducts(eq(keyword), eq(relevancePage))).thenReturn(productPage);

        Page<ProductResponse> responsePage = productService.searchProducts(keyword, pageable);

        assertNotNull(responsePage);
        assertEquals(1, responsePage.getTotalElements());
        assertEquals("Gaming Laptop", responsePage.getContent().get(0).name());
        verify(productRepository, times(1)).searchProducts(eq(keyword), eq(relevancePage));
    }
}
