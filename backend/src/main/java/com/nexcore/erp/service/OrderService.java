package com.nexcore.erp.service;

import com.nexcore.erp.entity.*;
import com.nexcore.erp.repository.InvoiceRepository;
import com.nexcore.erp.repository.OrderRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final com.nexcore.erp.util.SecurityUtils securityUtils;

    public OrderService(OrderRepository orderRepository,
                        InvoiceRepository invoiceRepository,
                        com.nexcore.erp.util.SecurityUtils securityUtils) {
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.securityUtils = securityUtils;
    }

    public Map<String, Object> getOrders(String status, String search, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("createdAt").descending());
        Page<Order> orderPage = orderRepository.findAllFiltered(status, search, pageable);
        return Map.of(
            "data", orderPage.getContent(),
            "total", orderPage.getTotalElements(),
            "page", page,
            "limit", limit
        );
    }

    public Order updateOrderStatus(Long id, String status) {
        securityUtils.checkWriteSales();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + id));

        String oldStatus = order.getStatus();
        order.setStatus(status);
        Order savedOrder = orderRepository.save(order);

        if ("CONFIRMED".equalsIgnoreCase(status) && !"CONFIRMED".equalsIgnoreCase(oldStatus)) {
            generateDraftInvoice(savedOrder);
        }

        return savedOrder;
    }

    private void generateDraftInvoice(Order order) {
        String invoiceNum = "INV-" + order.getOrderNumber();
        if (invoiceRepository.findByInvoiceNumber(invoiceNum).isPresent()) {
            return;
        }

        Invoice invoice = Invoice.builder()
                .invoiceNumber(invoiceNum)
                .order(order)
                .status("DRAFT")
                .dueDate(LocalDateTime.now().plusDays(30))
                .totalAmount(order.getTotalValue())
                .items(new ArrayList<>())
                .build();

        List<InvoiceItem> invoiceItems = new ArrayList<>();
        for (OrderItem orderItem : order.getItems()) {
            InvoiceItem invoiceItem = InvoiceItem.builder()
                    .invoice(invoice)
                    .product(orderItem.getProduct())
                    .quantity(orderItem.getQuantity())
                    .unitPrice(orderItem.getUnitPrice())
                    .build();
            invoiceItems.add(invoiceItem);
        }
        invoice.setItems(invoiceItems);

        invoiceRepository.save(invoice);
    }
}
