package com.nexcore.erp.service;

import com.nexcore.erp.entity.*;
import com.nexcore.erp.repository.*;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class ScheduledTasksService {

    private final ProductRepository productRepository;
    private final PurchaseRequestRepository purchaseRequestRepository;
    private final NotificationRepository notificationRepository;
    private final InvoiceRepository invoiceRepository;

    public ScheduledTasksService(ProductRepository productRepository,
                                 PurchaseRequestRepository purchaseRequestRepository,
                                 NotificationRepository notificationRepository,
                                 InvoiceRepository invoiceRepository) {
        this.productRepository = productRepository;
        this.purchaseRequestRepository = purchaseRequestRepository;
        this.notificationRepository = notificationRepository;
        this.invoiceRepository = invoiceRepository;
    }

    @Scheduled(fixedRate = 1800000)
    public void checkLowStockAndAutoReorder() {
        try {
            List<Product> lowStockProducts = productRepository.findAll().stream()
                    .filter(p -> p.getStockQty() < p.getReorderPoint())
                    .toList();

            for (Product product : lowStockProducts) {
                boolean prExists = purchaseRequestRepository.findAll().stream()
                        .anyMatch(pr -> pr.getProduct().getId().equals(product.getId()) && "PENDING".equalsIgnoreCase(pr.getStatus()));

                if (!prExists) {
                    int restockQty = product.getReorderPoint() * 3;
                    purchaseRequestRepository.save(PurchaseRequest.builder()
                            .product(product)
                            .quantity(restockQty)
                            .supplier(product.getSupplier())
                            .status("PENDING")
                            .build());

                    notificationRepository.save(Notification.builder()
                            .type("stock_alert")
                            .title("Auto Restock Triggered: " + product.getSku())
                            .message("Product " + product.getName() + " stock level is " + product.getStockQty() + ", below reorder point of " + product.getReorderPoint() + ". Pending purchase request created.")
                            .status("UNREAD")
                            .build());
                }
            }
        } catch (Exception e) {
            // fail-silent
        }
    }

    @Scheduled(fixedDelay = 86400000)
    public void checkOverdueInvoices() {
        try {
            List<Invoice> overdueInvoices = invoiceRepository.findByStatusAndDueDateBefore("SENT", LocalDateTime.now());

            for (Invoice invoice : overdueInvoices) {
                invoice.setStatus("OVERDUE");
                invoiceRepository.save(invoice);

                notificationRepository.save(Notification.builder()
                        .type("invoice_overdue")
                        .title("Overdue Invoice Alert: " + invoice.getInvoiceNumber())
                        .message("Invoice " + invoice.getInvoiceNumber() + " billed to " + invoice.getOrder().getCustomer().getName() + " is overdue. Due date was " + invoice.getDueDate().toLocalDate())
                        .status("UNREAD")
                        .build());
            }
        } catch (Exception e) {
            // fail-silent
        }
    }
}
