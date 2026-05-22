package com.nexcore.erp.service;

import com.nexcore.erp.entity.*;
import com.nexcore.erp.repository.AccountRepository;
import com.nexcore.erp.repository.InvoiceRepository;
import com.nexcore.erp.repository.JournalEntryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final com.nexcore.erp.util.SecurityUtils securityUtils;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          AccountRepository accountRepository,
                          JournalEntryRepository journalEntryRepository,
                          com.nexcore.erp.util.SecurityUtils securityUtils) {
        this.invoiceRepository = invoiceRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.securityUtils = securityUtils;
    }

    public Map<String, Object> getInvoices(String status, String search, int page, int limit) {
        Pageable pageable = PageRequest.of(page, limit, Sort.by("invoiceNumber").descending());
        Page<Invoice> invoicePage = invoiceRepository.findAllFiltered(status, search, pageable);
        return Map.of(
            "data", invoicePage.getContent(),
            "total", invoicePage.getTotalElements(),
            "page", page,
            "limit", limit
        );
    }

    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll(Sort.by(Sort.Order.desc("invoiceNumber")));
    }

    public Invoice updateInvoiceStatus(Long id, String status) {
        securityUtils.checkWriteFinance();
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Invoice not found with id: " + id));

        String oldStatus = invoice.getStatus();
        invoice.setStatus(status);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        if ("PAID".equalsIgnoreCase(status) && !"PAID".equalsIgnoreCase(oldStatus)) {
            recordPaymentJournalEntries(savedInvoice);
        } else if ("SENT".equalsIgnoreCase(status) && !"SENT".equalsIgnoreCase(oldStatus)) {
            recordInvoiceSentJournalEntries(savedInvoice);
        }

        return savedInvoice;
    }

    private void recordInvoiceSentJournalEntries(Invoice invoice) {
        Account arAcc = getOrCreateAccount("1200", "Accounts Receivable", "ASSET");
        Account salesAcc = getOrCreateAccount("4000", "Sales Revenue", "REVENUE");

        double amount = invoice.getTotalAmount();

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now())
                .account(arAcc)
                .description("Accounts Receivable for Invoice: " + invoice.getInvoiceNumber())
                .debit(amount)
                .credit(0.0)
                .balance(amount)
                .build());

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now())
                .account(salesAcc)
                .description("Sales Revenue for Invoice: " + invoice.getInvoiceNumber())
                .debit(0.0)
                .credit(amount)
                .balance(-amount)
                .build());
    }

    private void recordPaymentJournalEntries(Invoice invoice) {
        Account cashAcc = getOrCreateAccount("1010", "Cash and Cash Equivalents", "ASSET");
        Account arAcc = getOrCreateAccount("1200", "Accounts Receivable", "ASSET");

        double amount = invoice.getTotalAmount();

        boolean arExists = journalEntryRepository.findAll().stream()
                .anyMatch(je -> je.getDescription().contains(invoice.getInvoiceNumber()) && je.getAccount().getCode().equals("1200"));

        if (!arExists) {
            recordInvoiceSentJournalEntries(invoice);
        }

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now())
                .account(cashAcc)
                .description("Cash payment received for Invoice: " + invoice.getInvoiceNumber())
                .debit(amount)
                .credit(0.0)
                .balance(amount)
                .build());

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now())
                .account(arAcc)
                .description("Accounts Receivable cleared for Invoice: " + invoice.getInvoiceNumber())
                .debit(0.0)
                .credit(amount)
                .balance(-amount)
                .build());
    }

    private Account getOrCreateAccount(String code, String name, String type) {
        return accountRepository.findByCode(code)
                .orElseGet(() -> accountRepository.save(Account.builder()
                        .code(code)
                        .name(name)
                        .type(type)
                        .build()));
    }
}
