package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Integration;
import com.nexcore.erp.entity.Role;
import com.nexcore.erp.service.SettingsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getRoles() {
        return ResponseEntity.ok(settingsService.getRoles());
    }

    @PutMapping("/roles/{id}")
    public ResponseEntity<Role> updateRolePermissions(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(settingsService.updateRolePermissions(id, body));
    }

    @GetMapping("/integrations")
    public ResponseEntity<List<Integration>> getIntegrations() {
        return ResponseEntity.ok(settingsService.getIntegrations());
    }

    @PutMapping("/integrations/{name}")
    public ResponseEntity<Integration> updateIntegrationStatus(
            @PathVariable String name,
            @RequestBody Map<String, Object> body) {
        if (body.containsKey("status")) {
            String status = (String) body.get("status");
            return ResponseEntity.ok(settingsService.updateIntegrationStatus(name, status));
        }
        throw new IllegalArgumentException("Missing status parameter");
    }
}
