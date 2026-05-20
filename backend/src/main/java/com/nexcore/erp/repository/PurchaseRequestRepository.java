package com.nexcore.erp.repository;

import com.nexcore.erp.entity.PurchaseRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PurchaseRequestRepository extends JpaRepository<PurchaseRequest, Long> {
    Optional<PurchaseRequest> findFirstByProductIdAndStatus(Long productId, String status);
}
