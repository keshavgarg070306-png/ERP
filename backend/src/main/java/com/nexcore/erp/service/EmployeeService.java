package com.nexcore.erp.service;

import com.nexcore.erp.entity.*;
import com.nexcore.erp.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final com.nexcore.erp.util.SecurityUtils securityUtils;

    public EmployeeService(EmployeeRepository employeeRepository,
                           LeaveRequestRepository leaveRequestRepository,
                           PayrollRunRepository payrollRunRepository,
                           AccountRepository accountRepository,
                           JournalEntryRepository journalEntryRepository,
                           com.nexcore.erp.util.SecurityUtils securityUtils) {
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRunRepository = payrollRunRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.securityUtils = securityUtils;
    }

    public List<Employee> getEmployees() {
        return employeeRepository.findAllByOrderByNameAsc();
    }

    public Employee createEmployee(Map<String, Object> body) {
        securityUtils.checkWriteHR();
        String name = (String) body.get("name");
        String role = (String) body.get("role");
        String department = (String) body.get("department");
        double baseSalary = Double.parseDouble(body.get("baseSalary").toString());
        String status = body.containsKey("status") ? (String) body.get("status") : "ACTIVE";

        Employee employee = Employee.builder()
                .name(name)
                .role(role)
                .department(department)
                .baseSalary(baseSalary)
                .joinDate(LocalDateTime.now())
                .status(status)
                .avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=" + name.replace(" ", ""))
                .build();

        Employee saved = employeeRepository.save(employee);

        Optional<PayrollRun> pendingRunOpt = payrollRunRepository.findByStatus("PENDING");
        if (pendingRunOpt.isPresent()) {
            PayrollRun run = pendingRunOpt.get();
            double deductions = baseSalary * 0.20;
            double netPay = baseSalary - deductions;

            PayrollEntry entry = PayrollEntry.builder()
                    .payrollRun(run)
                    .employee(saved)
                    .baseSalary(baseSalary)
                    .deductions(deductions)
                    .netPay(netPay)
                    .status("PENDING")
                    .build();

            run.getPayrollEntries().add(entry);
            payrollRunRepository.save(run);
        }

        return saved;
    }

    public List<LeaveRequest> getLeaves() {
        return leaveRequestRepository.findAllByOrderByStartDateDesc();
    }

    public LeaveRequest updateLeaveStatus(Long id, String status) {
        securityUtils.checkWriteHR();
        LeaveRequest leave = leaveRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Leave request not found with id: " + id));

        leave.setStatus(status);
        return leaveRequestRepository.save(leave);
    }

    public List<PayrollRun> getPayrollRuns() {
        return payrollRunRepository.findAllByOrderByPeriodEndDesc();
    }

    public PayrollRun executePayrollRun() {
        securityUtils.checkWriteHR();
        PayrollRun run = payrollRunRepository.findByStatus("PENDING")
                .orElseThrow(() -> new RuntimeException("No pending payroll run found to execute"));

        run.setStatus("PROCESSED");
        run.setRunDate(LocalDateTime.now());

        Account wagesAcc = getOrCreateAccount("5000", "Wages and Salaries Expense", "EXPENSE");
        Account taxAcc = getOrCreateAccount("2100", "Withholding Taxes Payable", "LIABILITY");
        Account cashAcc = getOrCreateAccount("1010", "Cash and Cash Equivalents", "ASSET");

        for (PayrollEntry entry : run.getPayrollEntries()) {
            entry.setStatus("PROCESSED");

            double gross = entry.getBaseSalary();
            double ded = entry.getDeductions();
            double net = entry.getNetPay();

            journalEntryRepository.save(JournalEntry.builder()
                    .date(LocalDateTime.now())
                    .account(wagesAcc)
                    .description("Salary Gross Payout for: " + entry.getEmployee().getName())
                    .debit(gross)
                    .credit(0.0)
                    .balance(gross)
                    .build());

            if (ded > 0) {
                journalEntryRepository.save(JournalEntry.builder()
                        .date(LocalDateTime.now())
                        .account(taxAcc)
                        .description("Payroll Tax Withheld for: " + entry.getEmployee().getName())
                        .debit(0.0)
                        .credit(ded)
                        .balance(-ded)
                        .build());
            }

            journalEntryRepository.save(JournalEntry.builder()
                    .date(LocalDateTime.now())
                    .account(cashAcc)
                    .description("Salary Net Payment for: " + entry.getEmployee().getName())
                    .debit(0.0)
                    .credit(net)
                    .balance(-net)
                    .build());
        }

        PayrollRun saved = payrollRunRepository.save(run);

        LocalDateTime nextStart = run.getPeriodEnd().plusNanos(1);
        LocalDateTime nextEnd = run.getPeriodEnd().plusMonths(1);

        List<Employee> activeEmployees = employeeRepository.findAllByStatusIn(List.of("ACTIVE"));
        
        PayrollRun nextRun = PayrollRun.builder()
                .periodStart(nextStart)
                .periodEnd(nextEnd)
                .status("PENDING")
                .runDate(nextEnd)
                .payrollEntries(new ArrayList<>())
                .build();

        for (Employee emp : activeEmployees) {
            double base = emp.getBaseSalary();
            double deductions = base * 0.20;
            double net = base - deductions;

            PayrollEntry entry = PayrollEntry.builder()
                    .payrollRun(nextRun)
                    .employee(emp)
                    .baseSalary(base)
                    .deductions(deductions)
                    .netPay(net)
                    .status("PENDING")
                    .build();

            nextRun.getPayrollEntries().add(entry);
        }

        payrollRunRepository.save(nextRun);

        return saved;
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
