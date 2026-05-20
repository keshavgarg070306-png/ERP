package com.nexcore.erp.repository;

import com.nexcore.erp.entity.PayrollRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface PayrollRunRepository extends JpaRepository<PayrollRun, Long> {
    Optional<PayrollRun> findByStatus(String status);
    List<PayrollRun> findAllByOrderByPeriodEndDesc();
}
