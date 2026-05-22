package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Invoice;
import com.nexcore.erp.service.InvoiceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    @GetMapping
    public ResponseEntity<?> getInvoices(
            @RequestParam(value = "status", required = false, defaultValue = "") String status,
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        return ResponseEntity.ok(invoiceService.getInvoices(status, search, page, limit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Invoice> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("status")) {
            String status = (String) body.get("status");
            return ResponseEntity.ok(invoiceService.updateInvoiceStatus(id, status));
        }
        throw new IllegalArgumentException("Missing status parameter");
    }
}
