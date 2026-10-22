package com.ecommerce.api.product.service;

import com.ecommerce.api.common.exception.DuplicateResourceException;
import com.ecommerce.api.common.exception.ResourceNotFoundException;
import com.ecommerce.api.product.domain.Product;
import com.ecommerce.api.product.dto.CreateProductRequest;
import com.ecommerce.api.product.dto.ProductResponse;
import com.ecommerce.api.product.dto.UpdateProductRequest;
import com.ecommerce.api.product.repository.ProductRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    public ProductServiceImpl(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        if (productRepository.existsBySku(request.sku())) {
            throw new DuplicateResourceException("Product with SKU " + request.sku() + " already exists");
        }

        Product product = Product.builder()
                .sku(request.sku().toUpperCase().trim())
                .name(request.name().trim())
                .description(request.description())
                .category(request.category().toUpperCase().trim())
                .price(request.price())
                .stock(request.stock())
                .weightKg(request.weightKg())
                .isActive(true)
                .build();

        Product savedProduct = productRepository.save(product);
        return ProductResponse.fromEntity(savedProduct);
    }

    @Override
    public ProductResponse getProductById(Long id) {
        return productRepository.findByIdAndIsActiveTrue(id)
                .map(ProductResponse::fromEntity)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return productRepository.findByIsActiveTrue(pageable)
                .map(ProductResponse::fromEntity);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(Long id, UpdateProductRequest request) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setName(request.name().trim());
        product.setDescription(request.description());
        product.setCategory(request.category().toUpperCase().trim());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setWeightKg(request.weightKg());

        return ProductResponse.fromEntity(product);
    }

    @Override
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findByIdAndIsActiveTrue(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));

        product.setIsActive(false);
    }
}