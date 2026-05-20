package com.nexcore.erp.repository;

import com.nexcore.erp.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    Optional<Product> findBySku(String sku);

    @Query("SELECT p FROM Product p WHERE " +
           "(:search = '' OR :search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status = '' OR :status IS NULL OR p.status = :status) AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Product> findAllFiltered(
            @Param("search") String search,
            @Param("status") String status,
            @Param("categoryId") Long categoryId,
            Pageable pageable);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.stockQty < p.reorderPoint")
    long countLowStockItems();
}
