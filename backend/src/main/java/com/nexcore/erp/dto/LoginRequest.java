package com.nexcore.erp.dto;

public record LoginRequest(
    String email,
    String password,
    boolean rememberMe
) {}
