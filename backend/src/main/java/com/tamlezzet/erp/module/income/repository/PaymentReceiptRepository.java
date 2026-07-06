package com.tamlezzet.erp.module.income.repository;

import com.tamlezzet.erp.module.income.entity.PaymentReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentReceiptRepository extends JpaRepository<PaymentReceipt, Long> {
    List<PaymentReceipt> findByInvoiceId(Long invoiceId);
}
