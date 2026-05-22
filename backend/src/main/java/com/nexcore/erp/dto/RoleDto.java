package com.nexcore.erp.dto;

public record RoleDto(
    Long id,
    String name,
    boolean readInventory,
    boolean writeInventory,
    boolean readSales,
    boolean writeSales,
    boolean readFinance,
    boolean writeFinance,
    boolean readHR,
    boolean writeHR,
    boolean readSettings,
    boolean writeSettings
) {}
