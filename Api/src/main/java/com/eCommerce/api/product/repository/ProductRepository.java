package com.eCommerce.api.product.repository;

import com.eCommerce.api.product.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByIdAndIsActiveTrue(Long id);

    boolean existsBySku(String sku);

    Page<Product> findByIsActiveTrue(Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
            "(LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.category) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("""
        UPDATE Product p 
        SET p.stock = p.stock - :quantity 
        WHERE p.id = :id AND p.stock >= :quantity AND p.isActive = true
    """)
    int reserveStock(@Param("id") Long id, @Param("quantity") Integer quantity);

    @Modifying
    @Query("""
        UPDATE Product p 
        SET p.stock = p.stock + :quantity 
        WHERE p.id = :id AND p.isActive = true
    """)
    int releaseStock(@Param("id") Long id, @Param("quantity") Integer quantity);
}
