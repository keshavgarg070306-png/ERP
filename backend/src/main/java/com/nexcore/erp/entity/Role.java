package com.nexcore.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Role {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String name; // ADMIN, MANAGER, ACCOUNTANT, VIEWER

    @Builder.Default
    @Column(nullable = false)
    private boolean readInventory = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean writeInventory = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean readSales = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean writeSales = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean readFinance = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean writeFinance = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean readHR = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean writeHR = false;

    @Builder.Default
    @Column(nullable = false)
    private boolean readSettings = true;

    @Builder.Default
    @Column(nullable = false)
    private boolean writeSettings = false;
}
