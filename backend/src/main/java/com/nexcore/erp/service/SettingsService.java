package com.nexcore.erp.service;

import com.nexcore.erp.entity.Integration;
import com.nexcore.erp.entity.Role;
import com.nexcore.erp.repository.IntegrationRepository;
import com.nexcore.erp.repository.RoleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@Transactional
public class SettingsService {

    private final RoleRepository roleRepository;
    private final IntegrationRepository integrationRepository;
    private final com.nexcore.erp.util.SecurityUtils securityUtils;

    public SettingsService(RoleRepository roleRepository,
                           IntegrationRepository integrationRepository,
                           com.nexcore.erp.util.SecurityUtils securityUtils) {
        this.roleRepository = roleRepository;
        this.integrationRepository = integrationRepository;
        this.securityUtils = securityUtils;
    }

    public List<Role> getRoles() {
        return roleRepository.findAll();
    }

    public Role updateRolePermissions(Long id, Map<String, Object> body) {
        securityUtils.checkWriteSettings();
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Role not found with id: " + id));

        if (body.containsKey("readInventory")) {
            role.setReadInventory((Boolean) body.get("readInventory"));
        }
        if (body.containsKey("writeInventory")) {
            role.setWriteInventory((Boolean) body.get("writeInventory"));
        }
        if (body.containsKey("readSales")) {
            role.setReadSales((Boolean) body.get("readSales"));
        }
        if (body.containsKey("writeSales")) {
            role.setWriteSales((Boolean) body.get("writeSales"));
        }
        if (body.containsKey("readFinance")) {
            role.setReadFinance((Boolean) body.get("readFinance"));
        }
        if (body.containsKey("writeFinance")) {
            role.setWriteFinance((Boolean) body.get("writeFinance"));
        }
        if (body.containsKey("readHR")) {
            role.setReadHR((Boolean) body.get("readHR"));
        }
        if (body.containsKey("writeHR")) {
            role.setWriteHR((Boolean) body.get("writeHR"));
        }
        if (body.containsKey("readSettings")) {
            role.setReadSettings((Boolean) body.get("readSettings"));
        }
        if (body.containsKey("writeSettings")) {
            role.setWriteSettings((Boolean) body.get("writeSettings"));
        }

        return roleRepository.save(role);
    }

    public List<Integration> getIntegrations() {
        return integrationRepository.findAll();
    }

    public Integration updateIntegrationStatus(String name, String status) {
        securityUtils.checkWriteSettings();
        Integration integration = integrationRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Integration not found with name: " + name));

        integration.setStatus(status);
        return integrationRepository.save(integration);
    }
}
