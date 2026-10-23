package com.eCommerce.api.purchase.service;

import com.eCommerce.api.common.exception.ResourceNotFoundException;
import com.eCommerce.api.product.domain.Product;
import com.eCommerce.api.product.repository.ProductRepository;
import com.eCommerce.api.purchase.domain.OrderStatus;
import com.eCommerce.api.purchase.domain.PurchaseOrder;
import com.eCommerce.api.purchase.dto.CreatePurchaseRequest;
import com.eCommerce.api.purchase.dto.PurchaseResponse;
import com.eCommerce.api.purchase.event.PurchaseCreatedEvent;
import com.eCommerce.api.purchase.messaging.PurchaseProducer;
import com.eCommerce.api.purchase.repository.PurchaseOrderRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
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
    private PurchaseProducer purchaseProducer;

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    @Test
    @DisplayName("Should create purchase successfully, save order, and send event")
    void createPurchase_Success() {
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

        // Simular guardado de la orden asignándole un ID simulado
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
        assertEquals(BigDecimal.valueOf(1000.00), response.totalAmount()); // 500.00 * 2
        assertEquals(1, response.items().size());
        assertEquals("LAPTOP-SKU", response.items().get(0).sku());

        // Verificar que se llamó al productor con el evento correspondiente
        ArgumentCaptor<PurchaseCreatedEvent> eventCaptor = ArgumentCaptor.forClass(PurchaseCreatedEvent.class);
        verify(purchaseProducer, times(1)).sendPurchaseEvent(eventCaptor.capture());

        PurchaseCreatedEvent capturedEvent = eventCaptor.getValue();
        assertEquals(100L, capturedEvent.orderId());
        assertEquals("cliente@example.com", capturedEvent.customerEmail());
        assertEquals(BigDecimal.valueOf(1000.00), capturedEvent.totalAmount());
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
        verify(purchaseProducer, never()).sendPurchaseEvent(any());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when product stock is insufficient")
    void createPurchase_InsufficientStock() {
        // Arrange
        CreatePurchaseRequest.ItemRequest itemReq = new CreatePurchaseRequest.ItemRequest(1L, 15); // Pide 15
        CreatePurchaseRequest request = new CreatePurchaseRequest("cliente@example.com", List.of(itemReq));

        Product mockProduct = Product.builder()
                .id(1L)
                .name("Smartphone")
                .sku("PHONE-SKU")
                .price(BigDecimal.valueOf(300.00))
                .stock(5) // Solo hay 5 en stock
                .isActive(true)
                .build();

        when(productRepository.findByIdAndIsActiveTrue(1L)).thenReturn(Optional.of(mockProduct));

        // Act & Assert
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> purchaseService.createPurchase(request)
        );

        assertEquals("Insufficient stock for product: Smartphone", exception.getMessage());
        verify(purchaseOrderRepository, never()).save(any());
        verify(purchaseProducer, never()).sendPurchaseEvent(any());
    }
}