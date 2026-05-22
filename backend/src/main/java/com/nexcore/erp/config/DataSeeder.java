package com.nexcore.erp.config;

import com.nexcore.erp.entity.*;
import com.nexcore.erp.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final AccountRepository accountRepository;
    private final JournalEntryRepository journalEntryRepository;
    private final EmployeeRepository employeeRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final PayrollRunRepository payrollRunRepository;
    private final IntegrationRepository integrationRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(RoleRepository roleRepository,
                      UserRepository userRepository,
                      CategoryRepository categoryRepository,
                      SupplierRepository supplierRepository,
                      ProductRepository productRepository,
                      CustomerRepository customerRepository,
                      OrderRepository orderRepository,
                      InvoiceRepository invoiceRepository,
                      AccountRepository accountRepository,
                      JournalEntryRepository journalEntryRepository,
                      EmployeeRepository employeeRepository,
                      LeaveRequestRepository leaveRequestRepository,
                      PayrollRunRepository payrollRunRepository,
                      IntegrationRepository integrationRepository,
                      NotificationRepository notificationRepository,
                      PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.accountRepository = accountRepository;
        this.journalEntryRepository = journalEntryRepository;
        this.employeeRepository = employeeRepository;
        this.leaveRequestRepository = leaveRequestRepository;
        this.payrollRunRepository = payrollRunRepository;
        this.integrationRepository = integrationRepository;
        this.notificationRepository = notificationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        Role adminRole = roleRepository.save(Role.builder()
                .name("ADMIN")
                .readInventory(true).writeInventory(true)
                .readSales(true).writeSales(true)
                .readFinance(true).writeFinance(true)
                .readHR(true).writeHR(true)
                .readSettings(true).writeSettings(true)
                .build());

        Role accountantRole = roleRepository.save(Role.builder()
                .name("ACCOUNTANT")
                .readInventory(true).writeInventory(false)
                .readSales(true).writeSales(false)
                .readFinance(true).writeFinance(true)
                .readHR(true).writeHR(false)
                .readSettings(true).writeSettings(false)
                .build());

        Role managerRole = roleRepository.save(Role.builder()
                .name("MANAGER")
                .readInventory(true).writeInventory(true)
                .readSales(true).writeSales(true)
                .readFinance(true).writeFinance(false)
                .readHR(true).writeHR(true)
                .readSettings(true).writeSettings(false)
                .build());

        Role viewerRole = roleRepository.save(Role.builder()
                .name("VIEWER")
                .readInventory(true).writeInventory(false)
                .readSales(true).writeSales(false)
                .readFinance(true).writeFinance(false)
                .readHR(true).writeHR(false)
                .readSettings(true).writeSettings(false)
                .build());

        userRepository.save(User.builder()
                .name("Sarah Jenkins")
                .email("admin@nexcore.com")
                .password(passwordEncoder.encode("nexcore123"))
                .role(adminRole)
                .build());

        userRepository.save(User.builder()
                .name("Ananya Sharma")
                .email("accountant@nexcore.com")
                .password(passwordEncoder.encode("nexcore123"))
                .role(accountantRole)
                .build());

        userRepository.save(User.builder()
                .name("Marcus Vance")
                .email("manager@nexcore.com")
                .password(passwordEncoder.encode("nexcore123"))
                .role(managerRole)
                .build());

        userRepository.save(User.builder()
                .name("Robert Chen")
                .email("viewer@nexcore.com")
                .password(passwordEncoder.encode("nexcore123"))
                .role(viewerRole)
                .build());

        Category electronics = categoryRepository.save(Category.builder().name("Electronics").build());
        Category officeSupplies = categoryRepository.save(Category.builder().name("Office Supplies").build());
        Category industrialHardware = categoryRepository.save(Category.builder().name("Industrial Hardware").build());
        Category softwareLicenses = categoryRepository.save(Category.builder().name("Software Licenses").build());

        Supplier supplier1 = supplierRepository.save(Supplier.builder().name("TechDistributors Global").contactEmail("orders@techdistributors.com").build());
        Supplier supplier2 = supplierRepository.save(Supplier.builder().name("Apex Materials Ltd").contactEmail("sales@apexmaterials.com").build());

        Product compProduct = productRepository.save(Product.builder()
                .name("NexCore Core Processor")
                .sku("NC-COMP-01")
                .category(electronics)
                .stockQty(45)
                .reorderPoint(10)
                .unitCost(150.00)
                .status("IN_STOCK")
                .supplier(supplier1)
                .pricingTiers("{\"Retail\":299.99,\"Wholesale\":249.99}")
                .build());

        Product sensorProduct = productRepository.save(Product.builder()
                .name("Laser Sensor Module")
                .sku("NC-LSM-02")
                .category(electronics)
                .stockQty(3)
                .reorderPoint(5)
                .unitCost(25.00)
                .status("LOW_STOCK")
                .supplier(supplier1)
                .pricingTiers("{\"Retail\":59.99,\"Wholesale\":49.99}")
                .build());

        Product chairProduct = productRepository.save(Product.builder()
                .name("Office Desk Chair")
                .sku("NC-OFF-44")
                .category(officeSupplies)
                .stockQty(120)
                .reorderPoint(15)
                .unitCost(75.00)
                .status("IN_STOCK")
                .supplier(supplier2)
                .pricingTiers("{\"Retail\":149.99,\"Wholesale\":119.99}")
                .build());

        Customer stark = customerRepository.save(Customer.builder().name("Apex Tech Solutions").email("billing@apextech.com").phone("1-555-0199").build());
        Customer wayne = customerRepository.save(Customer.builder().name("Global Logistics Corp").email("accounts@globallogistics.com").phone("1-555-0142").build());
        Customer acme = customerRepository.save(Customer.builder().name("Zenith Manufacturing").email("purchasing@zenithmfg.org").phone("1-555-0100").build());

        Account cashAcc = accountRepository.save(Account.builder().code("1010").name("Cash and Cash Equivalents").type("ASSET").build());
        Account arAcc = accountRepository.save(Account.builder().code("1200").name("Accounts Receivable").type("ASSET").build());
        Account salesAcc = accountRepository.save(Account.builder().code("4000").name("Sales Revenue").type("REVENUE").build());
        Account wagesAcc = accountRepository.save(Account.builder().code("5000").name("Wages and Salaries Expense").type("EXPENSE").build());
        Account taxAcc = accountRepository.save(Account.builder().code("2100").name("Withholding Taxes Payable").type("LIABILITY").build());

        Order draftOrder = Order.builder()
                .orderNumber("ORD-1001")
                .customer(stark)
                .status("DRAFT")
                .totalValue(899.97)
                .build();
        draftOrder.setItems(List.of(
                OrderItem.builder().order(draftOrder).product(compProduct).quantity(3).unitPrice(299.99).build()
        ));
        orderRepository.save(draftOrder);

        Order confirmedOrder = Order.builder()
                .orderNumber("ORD-1002")
                .customer(wayne)
                .status("CONFIRMED")
                .totalValue(449.97)
                .build();
        confirmedOrder.setItems(List.of(
                OrderItem.builder().order(confirmedOrder).product(chairProduct).quantity(3).unitPrice(149.99).build()
        ));
        Order savedConfirmed = orderRepository.save(confirmedOrder);

        invoiceRepository.save(Invoice.builder()
                .invoiceNumber("INV-ORD-1002")
                .order(savedConfirmed)
                .status("DRAFT")
                .dueDate(LocalDateTime.now().plusDays(30))
                .totalAmount(449.97)
                .build());

        Order shippedOrder = Order.builder()
                .orderNumber("ORD-1003")
                .customer(acme)
                .status("SHIPPED")
                .totalValue(599.98)
                .build();
        shippedOrder.setItems(List.of(
                OrderItem.builder().order(shippedOrder).product(compProduct).quantity(2).unitPrice(299.99).build()
        ));
        Order savedShipped = orderRepository.save(shippedOrder);

        invoiceRepository.save(Invoice.builder()
                .invoiceNumber("INV-ORD-1003")
                .order(savedShipped)
                .status("PAID")
                .dueDate(LocalDateTime.now().minusDays(5))
                .totalAmount(599.98)
                .build());

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now().minusDays(5))
                .account(cashAcc)
                .description("Cash payment received for Invoice: INV-ORD-1003")
                .debit(599.98)
                .credit(0.0)
                .balance(599.98)
                .build());

        journalEntryRepository.save(JournalEntry.builder()
                .date(LocalDateTime.now().minusDays(5))
                .account(salesAcc)
                .description("Sales Revenue for Invoice: INV-ORD-1003")
                .debit(0.0)
                .credit(599.98)
                .balance(-599.98)
                .build());

        Employee emp1 = employeeRepository.save(Employee.builder().name("Sarah Jenkins").role("General Manager").department("Technology").baseSalary(9500).status("ACTIVE").avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=SarahJenkins").joinDate(LocalDateTime.now().minusMonths(6)).build());
        Employee emp2 = employeeRepository.save(Employee.builder().name("Ananya Sharma").role("Lead Accountant").department("Finance").baseSalary(8000).status("ACTIVE").avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=AnanyaSharma").joinDate(LocalDateTime.now().minusMonths(4)).build());
        Employee emp3 = employeeRepository.save(Employee.builder().name("David Miller").role("Sales Representative").department("Sales").baseSalary(6000).status("ACTIVE").avatar("https://api.dicebear.com/7.x/adventurer/svg?seed=DavidMiller").joinDate(LocalDateTime.now().minusMonths(2)).build());

        leaveRequestRepository.save(LeaveRequest.builder()
                .employee(emp3)
                .startDate(LocalDateTime.now().plusDays(2))
                .endDate(LocalDateTime.now().plusDays(9))
                .reason("Summer family travel vacation")
                .status("PENDING")
                .build());

        PayrollRun processedRun = PayrollRun.builder()
                .periodStart(LocalDateTime.now().minusMonths(1).withDayOfMonth(1))
                .periodEnd(LocalDateTime.now().minusMonths(1).withDayOfMonth(28))
                .status("PROCESSED")
                .runDate(LocalDateTime.now().minusMonths(1).withDayOfMonth(28))
                .payrollEntries(new ArrayList<>())
                .build();

        processedRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(processedRun).employee(emp1).baseSalary(9500).deductions(1900).netPay(7600).status("PROCESSED").build());
        processedRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(processedRun).employee(emp2).baseSalary(8000).deductions(1600).netPay(6400).status("PROCESSED").build());
        processedRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(processedRun).employee(emp3).baseSalary(6000).deductions(1200).netPay(4800).status("PROCESSED").build());
        payrollRunRepository.save(processedRun);

        journalEntryRepository.save(JournalEntry.builder().date(LocalDateTime.now().minusMonths(1).withDayOfMonth(28)).account(wagesAcc).description("Salary Gross Payout for employees").debit(23500.0).credit(0.0).balance(23500.0).build());
        journalEntryRepository.save(JournalEntry.builder().date(LocalDateTime.now().minusMonths(1).withDayOfMonth(28)).account(taxAcc).description("Payroll Tax Withheld").debit(0.0).credit(4700.0).balance(-4700.0).build());
        journalEntryRepository.save(JournalEntry.builder().date(LocalDateTime.now().minusMonths(1).withDayOfMonth(28)).account(cashAcc).description("Salary Net Payment paid").debit(0.0).credit(18800.0).balance(-18800.0).build());

        PayrollRun pendingRun = PayrollRun.builder()
                .periodStart(LocalDateTime.now().withDayOfMonth(1))
                .periodEnd(LocalDateTime.now().plusMonths(1).withDayOfMonth(1).minusDays(1))
                .status("PENDING")
                .runDate(LocalDateTime.now().plusMonths(1).withDayOfMonth(1).minusDays(1))
                .payrollEntries(new ArrayList<>())
                .build();

        pendingRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(pendingRun).employee(emp1).baseSalary(9500).deductions(1900).netPay(7600).status("PENDING").build());
        pendingRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(pendingRun).employee(emp2).baseSalary(8000).deductions(1600).netPay(6400).status("PENDING").build());
        pendingRun.getPayrollEntries().add(PayrollEntry.builder().payrollRun(pendingRun).employee(emp3).baseSalary(6000).deductions(1200).netPay(4800).status("PENDING").build());
        payrollRunRepository.save(pendingRun);

        integrationRepository.save(Integration.builder().name("stripe").status("CONNECTED").build());
        integrationRepository.save(Integration.builder().name("sendgrid").status("DISCONNECTED").build());
        integrationRepository.save(Integration.builder().name("slack").status("DISCONNECTED").build());

        notificationRepository.save(Notification.builder().type("stock_alert").title("Low Stock Warning: Laser Sensor Module").message("Sensor catalog level is 3, below reorder point of 5.").status("UNREAD").build());
        notificationRepository.save(Notification.builder().type("new_order").title("Confirmed Order: ORD-1002").message("Order ORD-1002 from Global Logistics Corp is confirmed. Draft invoice generated.").status("UNREAD").build());
    }
}
