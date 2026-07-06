package com.tamlezzet.erp.module.dashboard.service;

import com.tamlezzet.erp.module.dashboard.dto.DashboardDTO;
import com.tamlezzet.erp.module.document.repository.DocumentRepository;
import com.tamlezzet.erp.module.expense.repository.ExpenseRepository;
import com.tamlezzet.erp.module.export.entity.Shipment;
import com.tamlezzet.erp.module.export.repository.ShipmentRepository;
import com.tamlezzet.erp.module.farmer.repository.FarmerPurchaseRepository;
import com.tamlezzet.erp.module.income.repository.SalesInvoiceRepository;
import com.tamlezzet.erp.module.inventory.repository.InventoryItemRepository;
import com.tamlezzet.erp.module.meeting.repository.MeetingRepository;
import com.tamlezzet.erp.module.task.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final ExpenseRepository expenseRepository;
    private final FarmerPurchaseRepository farmerPurchaseRepository;
    private final ShipmentRepository shipmentRepository;
    private final MeetingRepository meetingRepository;
    private final TaskRepository taskRepository;
    private final InventoryItemRepository inventoryItemRepository;
    private final DocumentRepository documentRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        LocalDate today = LocalDate.now();
        YearMonth currentMonth = YearMonth.now();
        LocalDate monthStart = currentMonth.atDay(1);
        LocalDate monthEnd = currentMonth.atEndOfMonth();

        BigDecimal todaySales = nvl(salesInvoiceRepository.sumToday());
        BigDecimal todayExpenses = nvl(expenseRepository.sumToday());
        BigDecimal todayPurchases = nvl(farmerPurchaseRepository.sumToday());
        BigDecimal totalOutstanding = nvl(salesInvoiceRepository.totalOutstanding());
        BigDecimal monthlyRevenue = nvl(salesInvoiceRepository.sumInrBetween(monthStart, monthEnd));
        BigDecimal monthlyExpenses = nvl(expenseRepository.sumAmountBetween(monthStart, monthEnd));
        BigDecimal monthlyProfit = monthlyRevenue.subtract(monthlyExpenses);

        long pendingTasks = taskRepository.countPending();
        long upcomingMeetings = meetingRepository
                .findUpcoming(LocalDateTime.now(), LocalDateTime.now().plusDays(7)).size();
        long activeShipments = shipmentRepository.findByStatus(Shipment.ShipmentStatus.SHIPPED).size()
                + shipmentRepository.findByStatus(Shipment.ShipmentStatus.IN_TRANSIT).size();
        long lowStockItems = inventoryItemRepository.findLowStockItems().size();
        long expiringDocs = documentRepository.findExpiringSoon(today, today.plusDays(30)).size();

        // 6-month revenue/expense trend
        List<DashboardDTO.MonthlyTrendDTO> trend = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            BigDecimal rev = nvl(salesInvoiceRepository.sumInrBetween(s, e));
            BigDecimal exp = nvl(expenseRepository.sumAmountBetween(s, e));
            trend.add(DashboardDTO.MonthlyTrendDTO.builder()
                    .month(ym.format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .revenue(rev).expenses(exp).profit(rev.subtract(exp)).build());
        }

        // Upcoming meetings
        List<DashboardDTO.UpcomingMeetingDTO> meetings = meetingRepository
                .findUpcoming(LocalDateTime.now(), LocalDateTime.now().plusDays(7))
                .stream().limit(5)
                .map(m -> DashboardDTO.UpcomingMeetingDTO.builder()
                        .id(m.getId()).title(m.getTitle())
                        .scheduledAt(m.getScheduledAt().toString()).build())
                .toList();

        // Pending tasks
        List<DashboardDTO.PendingTaskDTO> tasks = taskRepository
                .findOverdue(today).stream().limit(5)
                .map(t -> DashboardDTO.PendingTaskDTO.builder()
                        .id(t.getId()).title(t.getTitle())
                        .priority(t.getPriority().name())
                        .dueDate(t.getDueDate().toString())
                        .assignedTo(t.getAssignedTo()).build())
                .toList();

        // Active shipments
        List<DashboardDTO.ActiveShipmentDTO> shipments = shipmentRepository
                .findByEtaBetween(today, today.plusDays(60)).stream().limit(5)
                .map(s -> DashboardDTO.ActiveShipmentDTO.builder()
                        .id(s.getId()).shipmentNumber(s.getShipmentNumber())
                        .buyer(s.getBuyerName()).destination(s.getDestinationCountry())
                        .status(s.getStatus().name())
                        .eta(s.getEta() != null ? s.getEta().toString() : "").build())
                .toList();

        return DashboardDTO.builder()
                .todaySales(todaySales)
                .todayPurchases(todayPurchases)
                .todayExpenses(todayExpenses)
                .totalOutstandingReceivable(totalOutstanding)
                .totalOutstandingPayable(BigDecimal.ZERO)
                .monthlyRevenue(monthlyRevenue)
                .monthlyExpenses(monthlyExpenses)
                .monthlyProfit(monthlyProfit)
                .bankBalance(BigDecimal.ZERO)  // integrates with bank feed if available
                .pendingTaskCount(pendingTasks)
                .upcomingMeetingCount(upcomingMeetings)
                .activeShipmentsCount(activeShipments)
                .lowStockItemsCount(lowStockItems)
                .expiringDocumentsCount(expiringDocs)
                .revenueExpenseTrend(trend)
                .upcomingMeetings(meetings)
                .pendingTasks(tasks)
                .activeShipments(shipments)
                .build();
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
