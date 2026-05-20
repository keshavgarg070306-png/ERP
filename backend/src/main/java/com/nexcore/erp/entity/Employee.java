package com.nexcore.erp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "employees")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String avatar;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false)
    private LocalDateTime joinDate;

    @Column(nullable = false)
    private String status; // ACTIVE, ON_LEAVE

    @Column(nullable = false)
    private double baseSalary;
}
