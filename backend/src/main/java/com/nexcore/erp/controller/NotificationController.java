package com.nexcore.erp.controller;

import com.nexcore.erp.entity.Notification;
import com.nexcore.erp.repository.NotificationRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
@Transactional
public class NotificationController {

    private final NotificationRepository notificationRepository;

    public NotificationController(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        List<Notification> list = notificationRepository.findAll(Sort.by(Sort.Order.desc("createdAt")));
        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + id));
        notification.setStatus("READ");
        notificationRepository.save(notification);
        return ResponseEntity.ok(Map.of("message", "Notification marked as read"));
    }

    private static class Map {
        public static java.util.Map<String, String> of(String k, String v) {
            return java.util.Map.of(k, v);
        }
    }

    @PutMapping("/read-all")
    public ResponseEntity<?> markAllAsRead() {
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> "UNREAD".equals(n.getStatus()))
                .toList();

        for (Notification n : unread) {
            n.setStatus("READ");
        }
        notificationRepository.saveAll(unread);

        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }
}
