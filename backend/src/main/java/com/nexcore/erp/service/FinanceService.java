package com.nexcore.erp.service;

import com.nexcore.erp.entity.Account;
import com.nexcore.erp.entity.JournalEntry;
import com.nexcore.erp.repository.JournalEntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional(readOnly = true)
public class FinanceService {

    private final JournalEntryRepository journalEntryRepository;

    public FinanceService(JournalEntryRepository journalEntryRepository) {
        this.journalEntryRepository = journalEntryRepository;
    }

    public List<JournalEntry> getLedger() {
        return journalEntryRepository.findAllByOrderByDateDesc();
    }

    public Map<String, Object> getProfitAndLoss(String period) {
        List<JournalEntry> entries = journalEntryRepository.findAll();

        Map<String, Map<String, Object>> incomeMap = new HashMap<>();
        Map<String, Map<String, Object>> expenseMap = new HashMap<>();

        for (JournalEntry entry : entries) {
            Account account = entry.getAccount();
            String code = account.getCode();
            String name = account.getName();
            String type = account.getType();

            if ("REVENUE".equalsIgnoreCase(type)) {
                double amount = entry.getCredit() - entry.getDebit();
                incomeMap.compute(code, (k, v) -> {
                    if (v == null) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("code", code);
                        m.put("name", name);
                        m.put("amount", amount);
                        return m;
                    } else {
                        v.put("amount", (double) v.get("amount") + amount);
                        return v;
                    }
                });
            } else if ("EXPENSE".equalsIgnoreCase(type)) {
                double amount = entry.getDebit() - entry.getCredit();
                expenseMap.compute(code, (k, v) -> {
                    if (v == null) {
                        Map<String, Object> m = new HashMap<>();
                        m.put("code", code);
                        m.put("name", name);
                        m.put("amount", amount);
                        return m;
                    } else {
                        v.put("amount", (double) v.get("amount") + amount);
                        return v;
                    }
                });
            }
        }

        List<Map<String, Object>> incomeList = new ArrayList<>(incomeMap.values());
        List<Map<String, Object>> expenseList = new ArrayList<>(expenseMap.values());

        double totalIncome = incomeList.stream().mapToDouble(m -> (double) m.get("amount")).sum();
        double totalExpense = expenseList.stream().mapToDouble(m -> (double) m.get("amount")).sum();
        double netProfit = totalIncome - totalExpense;

        return Map.of(
            "income", incomeList,
            "expenses", expenseList,
            "totals", Map.of(
                "income", totalIncome,
                "expense", totalExpense,
                "netProfit", netProfit
            )
        );
    }
}
