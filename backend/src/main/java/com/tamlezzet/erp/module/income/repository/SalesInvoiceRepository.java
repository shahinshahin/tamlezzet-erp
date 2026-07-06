package com.tamlezzet.erp.module.income.repository;

import com.tamlezzet.erp.module.income.entity.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long>, JpaSpecificationExecutor<SalesInvoice> {

    boolean existsByInvoiceNumber(String invoiceNumber);

    List<SalesInvoice> findByStatus(SalesInvoice.InvoiceStatus status);

    List<SalesInvoice> findByDueDateBefore(LocalDate date);

    List<SalesInvoice> findByCustomerCode(String customerCode);

    @Query("SELECT SUM(s.amountInr) FROM SalesInvoice s WHERE s.invoiceDate BETWEEN :start AND :end")
    BigDecimal sumInrBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT SUM(s.outstandingAmount) FROM SalesInvoice s WHERE s.status IN ('UNPAID','PARTIAL','OVERDUE')")
    BigDecimal totalOutstanding();

    @Query("SELECT SUM(s.amountInr) FROM SalesInvoice s WHERE CAST(s.invoiceDate AS date) = CURRENT_DATE")
    BigDecimal sumToday();
}
