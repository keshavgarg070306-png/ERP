package com.nexcore.erp.dto;

public record UserDto(
    Long id,
    String email,
    String name,
    RoleDto role
) {}
