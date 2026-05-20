package com.nexcore.erp.repository;

import com.nexcore.erp.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE " +
           "(:status = '' OR :status IS NULL OR i.status = :status) AND " +
           "(:search = '' OR :search IS NULL OR LOWER(i.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(i.order.customer.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Invoice> findAllFiltered(
            @Param("status") String status,
            @Param("search") String search,
            Pageable pageable);

    List<Invoice> findByStatusAndDueDateBefore(String status, LocalDateTime date);

    long countByStatusIn(List<String> statuses);

    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.status IN ('PAID', 'SENT')")
    Double sumPaidAndSentTotalAmount();
}
