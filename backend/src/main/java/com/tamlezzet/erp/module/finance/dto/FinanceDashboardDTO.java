package com.tamlezzet.erp.module.finance.dto;

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
public class FinanceDashboardDTO {

    // Summary
    private BigDecimal totalRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal grossProfit;
    private BigDecimal netProfit;

    // GST
    private BigDecimal gstCollected;
    private BigDecimal gstPaid;
    private BigDecimal gstPayable;

    // Cash flow
    private BigDecimal totalReceivables;
    private BigDecimal totalPayables;
    private BigDecimal netCashFlow;

    // Charts
    private List<MonthlyCashFlowDTO> cashFlowTrend;
    private Map<String, BigDecimal> expenseBreakdown;
    private List<SalesByCountryDTO> salesByCountry;
    private List<TopCustomerDTO> topCustomers;
    private List<ProfitLossMonthDTO> profitLossMonthly;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class MonthlyCashFlowDTO {
        private String month;
        private BigDecimal inflow;
        private BigDecimal outflow;
        private BigDecimal net;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class SalesByCountryDTO {
        private String country;
        private BigDecimal amount;
        private long shipmentCount;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TopCustomerDTO {
        private String customerName;
        private String country;
        private BigDecimal totalSales;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ProfitLossMonthDTO {
        private String month;
        private BigDecimal revenue;
        private BigDecimal cogs;
        private BigDecimal opex;
        private BigDecimal profit;
    }
}
