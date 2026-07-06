package com.tamlezzet.erp.module.finance.service;

import com.tamlezzet.erp.module.expense.repository.ExpenseRepository;
import com.tamlezzet.erp.module.finance.dto.FinanceDashboardDTO;
import com.tamlezzet.erp.module.income.repository.SalesInvoiceRepository;
import com.tamlezzet.erp.module.export.repository.ShipmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FinanceDashboardService {

    private final SalesInvoiceRepository salesRepo;
    private final ExpenseRepository expenseRepo;
    private final ShipmentRepository shipmentRepo;

    @Transactional(readOnly = true)
    public FinanceDashboardDTO getFinanceDashboard(int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = LocalDate.now().minusMonths(months);

        BigDecimal totalRevenue = nvl(salesRepo.sumInrBetween(startDate, endDate));
        BigDecimal totalExpenses = nvl(expenseRepo.sumAmountBetween(startDate, endDate));
        BigDecimal grossProfit = totalRevenue.subtract(totalExpenses);
        BigDecimal totalOutstanding = nvl(salesRepo.totalOutstanding());

        // GST
        List<Object[]> gstRows = expenseRepo.sumByCategory(startDate, endDate);
        BigDecimal gstPaid = gstRows.stream()
                .filter(r -> r[0].toString().equals("BANK_CHARGES") || r[0].toString().equals("CA"))
                .map(r -> (BigDecimal) r[1]).reduce(BigDecimal.ZERO, BigDecimal::add);

        // Expense breakdown
        Map<String, BigDecimal> expenseBreakdown = gstRows.stream()
                .collect(Collectors.toMap(r -> r[0].toString(), r -> (BigDecimal) r[1]));

        // Monthly cash flow trend
        List<FinanceDashboardDTO.MonthlyCashFlowDTO> cashFlowTrend = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            BigDecimal inflow = nvl(salesRepo.sumInrBetween(s, e));
            BigDecimal outflow = nvl(expenseRepo.sumAmountBetween(s, e));
            cashFlowTrend.add(FinanceDashboardDTO.MonthlyCashFlowDTO.builder()
                    .month(ym.format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .inflow(inflow).outflow(outflow).net(inflow.subtract(outflow)).build());
        }

        // Sales by country
        List<FinanceDashboardDTO.SalesByCountryDTO> salesByCountry = shipmentRepo
                .sumByCountry(startDate, endDate).stream()
                .map(r -> FinanceDashboardDTO.SalesByCountryDTO.builder()
                        .country((String) r[0]).amount((BigDecimal) r[1]).build())
                .toList();

        // Profit/Loss monthly
        List<FinanceDashboardDTO.ProfitLossMonthDTO> pnl = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            LocalDate s = ym.atDay(1);
            LocalDate e = ym.atEndOfMonth();
            BigDecimal rev = nvl(salesRepo.sumInrBetween(s, e));
            BigDecimal exp = nvl(expenseRepo.sumAmountBetween(s, e));
            pnl.add(FinanceDashboardDTO.ProfitLossMonthDTO.builder()
                    .month(ym.format(DateTimeFormatter.ofPattern("MMM yyyy")))
                    .revenue(rev).cogs(BigDecimal.ZERO).opex(exp).profit(rev.subtract(exp)).build());
        }

        return FinanceDashboardDTO.builder()
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .grossProfit(grossProfit)
                .netProfit(grossProfit)
                .gstCollected(BigDecimal.ZERO)
                .gstPaid(gstPaid)
                .gstPayable(BigDecimal.ZERO)
                .totalReceivables(totalOutstanding)
                .totalPayables(BigDecimal.ZERO)
                .netCashFlow(totalRevenue.subtract(totalExpenses))
                .cashFlowTrend(cashFlowTrend)
                .expenseBreakdown(expenseBreakdown)
                .salesByCountry(salesByCountry)
                .topCustomers(List.of())
                .profitLossMonthly(pnl)
                .build();
    }

    private BigDecimal nvl(BigDecimal v) {
        return v != null ? v : BigDecimal.ZERO;
    }
}
