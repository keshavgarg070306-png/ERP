package com.nexcore.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(unique = true, nullable = false)
    private String sku;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false)
    private int stockQty;

    @Column(nullable = false)
    private int reorderPoint;

    @Column(nullable = false)
    private double unitCost;

    @Column(nullable = false)
    private String status; // IN_STOCK, LOW_STOCK, OUT_OF_STOCK

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "supplier_id", nullable = false)
    private Supplier supplier;

    private String imageUrl;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String pricingTiers; // JSON-string configuration tiers
}
