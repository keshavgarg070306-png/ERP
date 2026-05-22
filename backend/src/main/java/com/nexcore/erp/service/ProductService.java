package com.nexcore.erp.service;

import com.nexcore.erp.entity.Category;
import com.nexcore.erp.entity.Product;
import com.nexcore.erp.entity.Supplier;
import com.nexcore.erp.repository.CategoryRepository;
import com.nexcore.erp.repository.ProductRepository;
import com.nexcore.erp.repository.SupplierRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@Transactional
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final com.nexcore.erp.util.SecurityUtils securityUtils;

    public ProductService(ProductRepository productRepository,
                          CategoryRepository categoryRepository,
                          SupplierRepository supplierRepository,
                          com.nexcore.erp.util.SecurityUtils securityUtils) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.securityUtils = securityUtils;
    }

    public Map<String, Object> getProducts(String search, String status, Long categoryId, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("name").ascending());
        Page<Product> productPage = productRepository.findAllFiltered(search, status, categoryId, pageable);
        return Map.of(
            "data", productPage.getContent(),
            "total", productPage.getTotalElements(),
            "page", page,
            "limit", limit
        );
    }

    public Product createProduct(Map<String, Object> body) {
        securityUtils.checkWriteInventory();
        String name = (String) body.get("name");
        String sku = (String) body.get("sku");
        Long categoryId = Long.valueOf(body.get("categoryId").toString());
        int stockQty = Integer.parseInt(body.get("stockQty").toString());
        int reorderPoint = Integer.parseInt(body.get("reorderPoint").toString());
        double unitCost = Double.parseDouble(body.get("unitCost").toString());
        Long supplierId = Long.valueOf(body.get("supplierId").toString());
        
        String pricingTiersStr = "{}";
        if (body.get("pricingTiers") instanceof Map) {
            try {
                pricingTiersStr = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(body.get("pricingTiers"));
            } catch (Exception e) {
                // ignore
            }
        } else if (body.get("pricingTiers") != null) {
            pricingTiersStr = body.get("pricingTiers").toString();
        }

        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found: " + categoryId));
        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new RuntimeException("Supplier not found: " + supplierId));

        String status = "IN_STOCK";
        if (stockQty == 0) {
            status = "OUT_OF_STOCK";
        } else if (stockQty < reorderPoint) {
            status = "LOW_STOCK";
        }

        Product product = Product.builder()
                .name(name)
                .sku(sku)
                .category(category)
                .stockQty(stockQty)
                .reorderPoint(reorderPoint)
                .unitCost(unitCost)
                .status(status)
                .supplier(supplier)
                .pricingTiers(pricingTiersStr)
                .build();

        return productRepository.save(product);
    }

    public Product updateStock(Long id, int stockQty) {
        securityUtils.checkWriteInventory();
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        product.setStockQty(stockQty);
        
        if (stockQty == 0) {
            product.setStatus("OUT_OF_STOCK");
        } else if (stockQty < product.getReorderPoint()) {
            product.setStatus("LOW_STOCK");
        } else {
            product.setStatus("IN_STOCK");
        }

        return productRepository.save(product);
    }
}
