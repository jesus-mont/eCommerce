package com.ecommerce.api.product.service;

import com.ecommerce.api.product.dto.CreateProductRequest;
import com.ecommerce.api.product.dto.ProductResponse;
import com.ecommerce.api.product.dto.UpdateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(Pageable pageable);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deactivateProduct(Long id);
}
