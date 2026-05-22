package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Employee;
import com.nexcore.erp.entity.LeaveRequest;
import com.nexcore.erp.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping
    public ResponseEntity<List<Employee>> getEmployees() {
        return ResponseEntity.ok(employeeService.getEmployees());
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(employeeService.createEmployee(body));
    }

    @GetMapping("/leaves")
    public ResponseEntity<List<LeaveRequest>> getLeaves() {
        return ResponseEntity.ok(employeeService.getLeaves());
    }

    @PutMapping("/leaves/{id}")
    public ResponseEntity<LeaveRequest> updateLeaveStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("status")) {
            String status = (String) body.get("status");
            return ResponseEntity.ok(employeeService.updateLeaveStatus(id, status));
        }
        throw new IllegalArgumentException("Missing status parameter");
    }
}
