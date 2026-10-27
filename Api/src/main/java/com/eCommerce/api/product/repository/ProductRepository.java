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

    @Query(
            value = "SELECT p.* FROM products p WHERE p.is_active = true AND " +
                    "NOT EXISTS (SELECT 1 FROM unnest(regexp_split_to_array(immutable_unaccent(lower(:keyword)), '\\s+')) AS terms(term) " +
                    "WHERE term <> '' AND NOT (immutable_unaccent(lower(p.name)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.name)) % term OR " +
                    "immutable_unaccent(lower(coalesce(p.description, ''))) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(coalesce(p.description, ''))) % term OR " +
                    "immutable_unaccent(lower(p.sku)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.sku)) % term OR " +
                    "immutable_unaccent(lower(p.category)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.category)) % term)) " +
                    "ORDER BY greatest(similarity(immutable_unaccent(lower(p.name)), immutable_unaccent(lower(:keyword))), " +
                    "similarity(immutable_unaccent(lower(p.sku)), immutable_unaccent(lower(:keyword)))) DESC, p.id",

            countQuery = "SELECT count(p.id) FROM products p WHERE p.is_active = true AND " +
                    "NOT EXISTS (SELECT 1 FROM unnest(regexp_split_to_array(immutable_unaccent(lower(:keyword)), '\\s+')) AS terms(term) " +
                    "WHERE term <> '' AND NOT (immutable_unaccent(lower(p.name)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.name)) % term OR " +
                    "immutable_unaccent(lower(coalesce(p.description, ''))) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(coalesce(p.description, ''))) % term OR " +
                    "immutable_unaccent(lower(p.sku)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.sku)) % term OR " +
                    "immutable_unaccent(lower(p.category)) LIKE '%' || term || '%' ESCAPE '\\' OR immutable_unaccent(lower(p.category)) % term))",

            nativeQuery = true
    )
    Page<Product> searchProducts(@Param("keyword") String keyword, Pageable pageable);

    @Modifying
    @Query("UPDATE Product p SET p.stock = p.stock + :qty, p.version = p.version + 1 WHERE p.id = :id")
    void restoreStock(@Param("id") Long productId, @Param("qty") int quantity);

    @Modifying(flushAutomatically = true)
    @Query(value = "UPDATE products SET stock = stock - :quantity, version = version + 1 WHERE id = :id AND is_active = true AND stock >= :quantity", nativeQuery = true)
    int reserveStock(@Param("id") Long productId, @Param("quantity") int quantity);
}
