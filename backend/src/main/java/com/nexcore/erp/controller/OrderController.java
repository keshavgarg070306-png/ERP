package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Order;
import com.nexcore.erp.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<?> getOrders(
            @RequestParam(value = "status", required = false, defaultValue = "") String status,
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        return ResponseEntity.ok(orderService.getOrders(status, search, page, limit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Order> updateOrderStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("status")) {
            String status = (String) body.get("status");
            return ResponseEntity.ok(orderService.updateOrderStatus(id, status));
        }
        throw new IllegalArgumentException("Missing status parameter");
    }
}
