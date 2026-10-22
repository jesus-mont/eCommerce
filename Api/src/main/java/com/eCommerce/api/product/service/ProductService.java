package com.eCommerce.api.product.service;

import com.eCommerce.api.product.dto.CreateProductRequest;
import com.eCommerce.api.product.dto.ProductResponse;
import com.eCommerce.api.product.dto.UpdateProductRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    ProductResponse createProduct(CreateProductRequest request);
    ProductResponse getProductById(Long id);
    Page<ProductResponse> getAllProducts(Pageable pageable);
    ProductResponse updateProduct(Long id, UpdateProductRequest request);
    void deactivateProduct(Long id);
}
