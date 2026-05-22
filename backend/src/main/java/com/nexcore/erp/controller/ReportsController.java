package com.nexcore.erp.controller;

import com.nexcore.erp.service.FinanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reports")
public class ReportsController {

    private final FinanceService financeService;

    public ReportsController(FinanceService financeService) {
        this.financeService = financeService;
    }

    @GetMapping("/ledger")
    public ResponseEntity<?> getLedger() {
        return ResponseEntity.ok(financeService.getLedger());
    }

    @GetMapping("/pl")
    public ResponseEntity<?> getProfitAndLoss(@RequestParam(value = "period", defaultValue = "monthly") String period) {
        return ResponseEntity.ok(financeService.getProfitAndLoss(period));
    }
}
