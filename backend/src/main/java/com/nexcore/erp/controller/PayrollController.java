package com.nexcore.erp.controller;

import com.nexcore.erp.entity.PayrollRun;
import com.nexcore.erp.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/payroll")
public class PayrollController {

    private final EmployeeService employeeService;

    public PayrollController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/runs")
    public ResponseEntity<List<PayrollRun>> getPayrollRuns() {
        return ResponseEntity.ok(employeeService.getPayrollRuns());
    }

    @PostMapping("/run")
    public ResponseEntity<PayrollRun> executePayrollRun() {
        return ResponseEntity.ok(employeeService.executePayrollRun());
    }
}
