package com.nexcore.erp.repository;

import com.nexcore.erp.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    List<Employee> findAllByOrderByNameAsc();
    List<Employee> findAllByStatusIn(List<String> statuses);
}
