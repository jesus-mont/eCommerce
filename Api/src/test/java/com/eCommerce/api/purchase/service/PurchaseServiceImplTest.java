package com.eCommerce.api.purchase.service;

import com.eCommerce.api.common.exception.ResourceNotFoundException;
import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.repository.ProductRepository;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;
import com.eCommerce.api.purchase.domain.OutboxEvent;
import com.eCommerce.api.purchase.repository.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceImplTest {

    @Mock
    private PurchaseOrderRepository purchaseOrderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private OutboxEventRepository outboxEventRepository;

    @Mock
    private ObjectMapper objectMapper;


    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    @Test
    @DisplayName("Should create purchase successfully, save order, and send event")
    void createPurchase_Success() throws Exception {
        // Arrange
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(1L, 2);
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(itemReq));

        Product mockProduct = Product.builder()
                .id(1L)
                .name("Laptop")
                .sku("LAPTOP-SKU")
                .price(BigDecimal.valueOf(500.00))
                .stock(10)
                .isActive(true)
                .build();

        when(productRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(mockProduct));
        when(productRepository.reserveStock(1L, 2)).thenReturn(1);
        when(objectMapper.writeValueAsString(any())).thenReturn("{}");

        when(purchaseOrderRepository.save(any(PurchaseOrder.class))).thenAnswer(invocation -> {
            PurchaseOrder orderToSave = invocation.getArgument(0);
            orderToSave.setId(100L);
            orderToSave.setCreatedAt(OffsetDateTime.now());
            orderToSave.setUpdatedAt(OffsetDateTime.now());
            return orderToSave;
        });

        // Act
        PurchaseResponse response = purchaseService.createPurchase(request);

        // Assert
        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("cliente@example.com", response.customerEmail());
        assertEquals(OrderStatus.PENDING, response.status());
        assertEquals(BigDecimal.valueOf(1000.00), response.totalAmount());
        assertEquals(1, response.items().size());
        assertEquals("LAPTOP-SKU", response.items().get(0).sku());

        ArgumentCaptor<OutboxEvent> captor = ArgumentCaptor.forClass(OutboxEvent.class);
        verify(outboxEventRepository).save(captor.capture());
        assertEquals("PurchaseCreatedEvent", captor.getValue().getEventType());
        assertEquals("{}", captor.getValue().getPayload());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist or is inactive")
    void createPurchase_ProductNotFound() {
        // Arrange
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(99L, 1);
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(itemReq));

        when(productRepository.findByIdAndIsActiveTrue(99L)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> purchaseService.createPurchase(request)
        );

        assertEquals("Product not found with id: 99", exception.getMessage());
        verify(purchaseOrderRepository, never()).save(any());
        verify(outboxEventRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when product stock is insufficient")
    void createPurchase_InsufficientStock() {
        // Arrange
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(1L, 15);
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(itemReq));

        Product mockProduct = Product.builder()
                .id(1L)
                .name("Smartphone")
                .sku("PHONE-SKU")
                .price(BigDecimal.valueOf(300.00))
                .stock(5)
                .isActive(true)
                .build();

        when(productRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(mockProduct));

        // Act & Assert
        when(productRepository.reserveStock(1L, 15)).thenReturn(0);
        com.eCommerce.api.common.exception.InsufficientStockException exception = assertThrows(
                com.eCommerce.api.common.exception.InsufficientStockException.class,
                () -> purchaseService.createPurchase(request)
        );

        assertEquals("Insufficient stock for product: Smartphone", exception.getMessage());
        verify(purchaseOrderRepository, never()).save(any());
        verify(outboxEventRepository, never()).save(any());
    }

    @Test
    @DisplayName("throw IllegalArgumentException when purchase contains no items")
    void createPurchase_EmptyItems() {
        // Arrange
        CreatePurchaseRequest request = new CreatePurchaseRequest("customer@example.com", List.of());

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> purchaseService.createPurchase(request)
        );

        assertEquals("Purchase must contain at least one item", exception.getMessage());

        verify(productRepository, never()).findByIdAndIsActiveTrue(any());
        verify(purchaseOrderRepository, never()).save(any());
        verify(outboxEventRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenOptimisticLockingFailsDuringPurchase() {
        Long productId = 1L;
        int quantity = 2;

        CreatePurchaseRequest.ItemRequest itemRequest = new CreatePurchaseRequest.ItemRequest(productId, quantity);
        CreatePurchaseRequest request = new CreatePurchaseRequest("customer@test.com", List.of(itemRequest));

        Product mockProduct = new Product();
        mockProduct.setId(productId);
        mockProduct.setName("Laptop Gaming");
        mockProduct.setSku("LAP-001");
        mockProduct.setPrice(BigDecimal.valueOf(1200.00));
        mockProduct.setStock(10);
        mockProduct.setVersion(1L);

        when(productRepository.findByIdAndIsActiveTrue(productId)).thenReturn(Optional.of(mockProduct));
        when(productRepository.reserveStock(productId, quantity)).thenReturn(0);

        assertThrows(com.eCommerce.api.common.exception.InsufficientStockException.class,
                () -> purchaseService.createPurchase(request));
    }

    @Test
    @DisplayName("return paginated page of purchases")
    void getAllPurchases_Success() {
        // Arrange
        Pageable pageable = PageRequest.of(0, 20);
        PurchaseOrder purchase = PurchaseOrder.builder()
                .id(1L)
                .customerEmail("customer@example.com")
                .status(OrderStatus.COMPLETED)
                .createdAt(OffsetDateTime.now())
                .totalAmount(BigDecimal.valueOf(1000))
                .build();

        Page<PurchaseOrder> purchasePage = new PageImpl<>(List.of(purchase), pageable, 1);
        when(purchaseOrderRepository.findAll(pageable)).thenReturn(purchasePage);

        // Act
        Page<PurchaseResponse> responsePage = purchaseService.getAllPurchases(pageable);

        // Assert
        assertNotNull(responsePage);
        assertEquals(1, responsePage.getTotalElements());
        assertEquals("customer@example.com", responsePage.getContent().get(0).customerEmail());
        verify(purchaseOrderRepository, times(1)).findAll(pageable);
    }

    @Test
    @DisplayName("return purchase response when purchase exists by id")
    void getPurchaseById_Success() {
        // Arrange
        Long purchaseId = 1L;
        PurchaseOrder purchase = PurchaseOrder.builder()
                .id(purchaseId)
                .customerEmail("customer@example.com")
                .totalAmount(BigDecimal.valueOf(500))
                .build();

        when(purchaseOrderRepository.findById(purchaseId)).thenReturn(Optional.of(purchase));

        // Act
        PurchaseResponse response = purchaseService.getPurchaseById(purchaseId);

        // Assert
        assertNotNull(response);
        assertEquals(purchaseId, response.id());
        assertEquals("customer@example.com", response.customerEmail());
        verify(purchaseOrderRepository, times(1)).findById(purchaseId);
    }

    @Test
    @DisplayName("throw ResourceNotFoundException when purchase does not exist by id")
    void getPurchaseById_NotFound() {
        // Arrange
        Long purchaseId = 99L;
        when(purchaseOrderRepository.findById(purchaseId)).thenReturn(Optional.empty());

        // Act & Assert
        ResourceNotFoundException exception = assertThrows(
                ResourceNotFoundException.class,
                () -> purchaseService.getPurchaseById(purchaseId)
        );

        assertEquals("Purchase not found with id: " + purchaseId, exception.getMessage());
        verify(purchaseOrderRepository, times(1)).findById(purchaseId);
    }
}
