package com.nexcore.erp.mapper;

import com.nexcore.erp.dto.RoleDto;
import com.nexcore.erp.dto.UserDto;
import com.nexcore.erp.entity.Role;
import com.nexcore.erp.entity.User;

public class DtoMapper {

    public static RoleDto toDto(Role role) {
        if (role == null) return null;
        return new RoleDto(
            role.getId(),
            role.getName(),
            role.isReadInventory(),
            role.isWriteInventory(),
            role.isReadSales(),
            role.isWriteSales(),
            role.isReadFinance(),
            role.isWriteFinance(),
            role.isReadHR(),
            role.isWriteHR(),
            role.isReadSettings(),
            role.isWriteSettings()
        );
    }

    public static UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(
            user.getId(),
            user.getEmail(),
            user.getName(),
            toDto(user.getRole())
        );
    }
}
