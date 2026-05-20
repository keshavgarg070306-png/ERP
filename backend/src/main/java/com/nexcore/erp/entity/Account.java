package com.nexcore.erp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String code; // e.g. 1010, 2000

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
}
