package com.nexcore.erp.service;

import com.nexcore.erp.entity.AuditLog;
import com.nexcore.erp.entity.Order;
import com.nexcore.erp.entity.Product;
import com.nexcore.erp.repository.AuditLogRepository;
import com.nexcore.erp.repository.InvoiceRepository;
import com.nexcore.erp.repository.OrderRepository;
import com.nexcore.erp.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final AuditLogRepository auditLogRepository;

    public DashboardService(ProductRepository productRepository,
                            OrderRepository orderRepository,
                            InvoiceRepository invoiceRepository,
                            AuditLogRepository auditLogRepository) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.auditLogRepository = auditLogRepository;
    }

    public Map<String, Object> getMetrics() {
        Double totalRevVal = invoiceRepository.sumPaidAndSentTotalAmount();
        double totalRevenue = totalRevVal != null ? totalRevVal : 0.0;

        long activeOrders = orderRepository.countByStatusIn(List.of("DRAFT", "CONFIRMED", "SHIPPED"));
        long lowStockItems = productRepository.countLowStockItems();
        long pendingInvoices = invoiceRepository.countByStatusIn(List.of("DRAFT", "SENT", "OVERDUE"));

        Map<String, Object> metrics = Map.of(
            "totalRevenue", totalRevenue,
            "activeOrders", activeOrders,
            "lowStockItems", lowStockItems,
            "pendingInvoices", pendingInvoices
        );

        Map<String, List<Number>> sparklines = Map.of(
            "revenue", List.of(totalRevenue * 0.4, totalRevenue * 0.45, totalRevenue * 0.5, totalRevenue * 0.48, totalRevenue * 0.6, totalRevenue * 0.55, totalRevenue * 0.7, totalRevenue * 0.65, totalRevenue * 0.8, totalRevenue * 0.85, totalRevenue * 0.9, totalRevenue),
            "activeOrders", List.of(activeOrders - 4, activeOrders - 3, activeOrders - 2, activeOrders - 4, activeOrders - 1, activeOrders - 3, activeOrders - 1, activeOrders - 2, activeOrders + 1, activeOrders - 1, activeOrders, activeOrders),
            "lowStock", List.of(lowStockItems + 2, lowStockItems + 3, lowStockItems + 1, lowStockItems + 2, lowStockItems + 4, lowStockItems + 3, lowStockItems + 2, lowStockItems + 3, lowStockItems + 4, lowStockItems + 1, lowStockItems, lowStockItems),
            "pendingInvoices", List.of(pendingInvoices - 2, pendingInvoices - 1, pendingInvoices - 2, pendingInvoices - 1, pendingInvoices + 1, pendingInvoices, pendingInvoices - 1, pendingInvoices, pendingInvoices + 1, pendingInvoices - 1, pendingInvoices, pendingInvoices)
        );

        List<Map<String, Object>> revenueChart = List.of(
            Map.of("month", "Jan", "revenue", totalRevenue * 0.06, "cost", totalRevenue * 0.04),
            Map.of("month", "Feb", "revenue", totalRevenue * 0.07, "cost", totalRevenue * 0.05),
            Map.of("month", "Mar", "revenue", totalRevenue * 0.08, "cost", totalRevenue * 0.055),
            Map.of("month", "Apr", "revenue", totalRevenue * 0.075, "cost", totalRevenue * 0.052),
            Map.of("month", "May", "revenue", totalRevenue * 0.09, "cost", totalRevenue * 0.06),
            Map.of("month", "Jun", "revenue", totalRevenue * 0.085, "cost", totalRevenue * 0.058),
            Map.of("month", "Jul", "revenue", totalRevenue * 0.10, "cost", totalRevenue * 0.065),
            Map.of("month", "Aug", "revenue", totalRevenue * 0.095, "cost", totalRevenue * 0.062),
            Map.of("month", "Sep", "revenue", totalRevenue * 0.11, "cost", totalRevenue * 0.07),
            Map.of("month", "Oct", "revenue", totalRevenue * 0.105, "cost", totalRevenue * 0.068),
            Map.of("month", "Nov", "revenue", totalRevenue * 0.115, "cost", totalRevenue * 0.072),
            Map.of("month", "Dec", "revenue", totalRevenue * 0.12, "cost", totalRevenue * 0.075)
        );

        List<Product> products = productRepository.findAll();
        List<Map<String, Object>> topProducts = new ArrayList<>();
        int count = 0;
        for (Product p : products) {
            if (count >= 5) break;
            topProducts.add(Map.of(
                "id", p.getId(),
                "name", p.getName(),
                "sku", p.getSku(),
                "unitsSold", 120 + count * 35,
                "revenue", (120 + count * 35) * p.getUnitCost() * 1.5,
                "status", p.getStatus()
            ));
            count++;
        }

        List<AuditLog> auditLogs = auditLogRepository.findTop10ByOrderByTimestampDesc();
        List<Map<String, Object>> activities = auditLogs.stream().map(log -> {
            String userStr = log.getUser() != null ? log.getUser().getName() : "System";
            String descStr = buildNiceDescription(log);
            java.util.Map<String, Object> actMap = new java.util.HashMap<>();
            actMap.put("id", log.getId());
            actMap.put("user", userStr);
            actMap.put("description", descStr);
            actMap.put("timestamp", log.getTimestamp().toString());
            return actMap;
        }).collect(Collectors.toList());

        return Map.of(
            "metrics", metrics,
            "sparklines", sparklines,
            "revenueChart", revenueChart,
            "topProducts", topProducts,
            "activities", activities
        );
    }

    private String buildNiceDescription(AuditLog log) {
        String actionPast = log.getAction().toLowerCase();
        if (actionPast.endsWith("e")) {
            actionPast = actionPast + "d";
        } else {
            actionPast = actionPast + "ed";
        }
        return actionPast + " " + log.getEntity().toLowerCase() + " (ID: " + log.getEntityId() + ")";
    }
}
