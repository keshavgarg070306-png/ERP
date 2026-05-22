package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Product;
import com.nexcore.erp.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<?> getProducts(
            @RequestParam(value = "search", required = false, defaultValue = "") String search,
            @RequestParam(value = "status", required = false, defaultValue = "") String status,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "limit", defaultValue = "100") int limit) {
        return ResponseEntity.ok(productService.getProducts(search, status, categoryId, page, limit));
    }

    @PostMapping
    public ResponseEntity<Product> createProduct(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(productService.createProduct(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> updateStock(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("stockQty")) {
            int stockQty = Integer.parseInt(body.get("stockQty").toString());
            return ResponseEntity.ok(productService.updateStock(id, stockQty));
        }
        throw new IllegalArgumentException("Missing stockQty parameter");
    }
}
