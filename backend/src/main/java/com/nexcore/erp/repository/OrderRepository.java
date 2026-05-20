package com.nexcore.erp.repository;

import com.nexcore.erp.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT o FROM Order o WHERE " +
           "(:status = '' OR :status IS NULL OR o.status = :status) AND " +
           "(:search = '' OR :search IS NULL OR LOWER(o.orderNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Order> findAllFiltered(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    long countByStatusIn(List<String> statuses);
}
