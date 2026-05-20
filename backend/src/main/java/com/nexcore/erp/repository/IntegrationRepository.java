package com.nexcore.erp.repository;

import com.nexcore.erp.entity.Integration;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface IntegrationRepository extends JpaRepository<Integration, Long> {
    Optional<Integration> findByName(String name);
}
