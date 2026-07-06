package com.tamlezzet.erp.module.dashboard.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {

    // Today's figures
    private BigDecimal todaySales;
    private BigDecimal todayPurchases;
    private BigDecimal todayExpenses;

    // Outstanding
    private BigDecimal totalOutstandingReceivable;
    private BigDecimal totalOutstandingPayable;

    // Monthly
    private BigDecimal monthlyRevenue;
    private BigDecimal monthlyExpenses;
    private BigDecimal monthlyProfit;

    // Bank / Cash
    private BigDecimal bankBalance;

    // Counts
    private long pendingTaskCount;
    private long upcomingMeetingCount;
    private long activeShipmentsCount;
    private long lowStockItemsCount;
    private long expiringDocumentsCount;

    // Charts
    private List<MonthlyTrendDTO> revenueExpenseTrend;
    private Map<String, BigDecimal> expenseByCategory;
    private List<ShipmentStatusDTO> shipmentStatusSummary;
    private List<UpcomingMeetingDTO> upcomingMeetings;
    private List<PendingTaskDTO> pendingTasks;
    private List<ActiveShipmentDTO> activeShipments;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyTrendDTO {
        private String month;
        private BigDecimal revenue;
        private BigDecimal expenses;
        private BigDecimal profit;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ShipmentStatusDTO {
        private String status;
        private long count;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class UpcomingMeetingDTO {
        private Long id;
        private String title;
        private String scheduledAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class PendingTaskDTO {
        private Long id;
        private String title;
        private String priority;
        private String dueDate;
        private String assignedTo;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ActiveShipmentDTO {
        private Long id;
        private String shipmentNumber;
        private String buyer;
        private String destination;
        private String status;
        private String eta;
    }
}
