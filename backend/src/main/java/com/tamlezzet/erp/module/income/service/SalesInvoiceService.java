package com.tamlezzet.erp.module.income.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.common.service.S3Service;
import com.tamlezzet.erp.module.income.dto.PaymentReceiptDTO;
import com.tamlezzet.erp.module.income.dto.SalesInvoiceDTO;
import com.tamlezzet.erp.module.income.entity.PaymentReceipt;
import com.tamlezzet.erp.module.income.entity.SalesInvoice;
import com.tamlezzet.erp.module.income.repository.PaymentReceiptRepository;
import com.tamlezzet.erp.module.income.repository.SalesInvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SalesInvoiceService {

    private final SalesInvoiceRepository invoiceRepository;
    private final PaymentReceiptRepository receiptRepository;
    private final S3Service s3Service;

    @Transactional
    public SalesInvoiceDTO create(SalesInvoiceDTO dto) {
        if (invoiceRepository.existsByInvoiceNumber(dto.getInvoiceNumber())) {
            throw new IllegalArgumentException("Invoice number already exists: " + dto.getInvoiceNumber());
        }
        SalesInvoice invoice = toEntity(dto);
        invoice.setAmountInr(dto.getAmountForeign().multiply(dto.getExchangeRate()));
        invoice.setOutstandingAmount(invoice.getAmountInr());
        return toDTO(invoiceRepository.save(invoice));
    }

    @Transactional
    public SalesInvoiceDTO update(Long id, SalesInvoiceDTO dto) {
        SalesInvoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
        invoice.setCustomerName(dto.getCustomerName());
        invoice.setCustomerCode(dto.getCustomerCode());
        invoice.setDueDate(dto.getDueDate());
        invoice.setCurrency(dto.getCurrency());
        invoice.setExchangeRate(dto.getExchangeRate());
        invoice.setAmountForeign(dto.getAmountForeign());
        invoice.setAmountInr(dto.getAmountForeign().multiply(dto.getExchangeRate()));
        invoice.setNotes(dto.getNotes());
        recalculate(invoice);
        return toDTO(invoiceRepository.save(invoice));
    }

    @Transactional
    public PaymentReceiptDTO addPayment(Long invoiceId, PaymentReceiptDTO dto) {
        SalesInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + invoiceId));

        PaymentReceipt receipt = PaymentReceipt.builder()
                .invoice(invoice)
                .receiptDate(dto.getReceiptDate())
                .amountForeign(dto.getAmountForeign())
                .amountInr(dto.getAmountForeign().multiply(dto.getExchangeRate()))
                .exchangeRate(dto.getExchangeRate())
                .bankReference(dto.getBankReference())
                .notes(dto.getNotes())
                .build();
        receiptRepository.save(receipt);

        invoice.setReceivedAmount(invoice.getReceivedAmount().add(receipt.getAmountInr()));
        recalculate(invoice);
        invoiceRepository.save(invoice);

        return toReceiptDTO(receipt);
    }

    public SalesInvoiceDTO getById(Long id) {
        return invoiceRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
    }

    public PageResponseDTO<SalesInvoiceDTO> list(Pageable pageable) {
        Page<SalesInvoice> page = invoiceRepository.findAll(pageable);
        return PageResponseDTO.<SalesInvoiceDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<SalesInvoiceDTO> listOverdue() {
        return invoiceRepository.findByDueDateBefore(LocalDate.now()).stream()
                .filter(i -> i.getStatus() != SalesInvoice.InvoiceStatus.PAID
                        && i.getStatus() != SalesInvoice.InvoiceStatus.CANCELLED)
                .map(this::toDTO).toList();
    }

    public BigDecimal totalOutstanding() {
        BigDecimal v = invoiceRepository.totalOutstanding();
        return v != null ? v : BigDecimal.ZERO;
    }

    public BigDecimal todayTotal() {
        BigDecimal v = invoiceRepository.sumToday();
        return v != null ? v : BigDecimal.ZERO;
    }

    // ---- helpers ----
    private void recalculate(SalesInvoice invoice) {
        BigDecimal outstanding = invoice.getAmountInr().subtract(invoice.getReceivedAmount());
        invoice.setOutstandingAmount(outstanding.max(BigDecimal.ZERO));
        if (outstanding.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(SalesInvoice.InvoiceStatus.PAID);
        } else if (invoice.getReceivedAmount().compareTo(BigDecimal.ZERO) > 0) {
            invoice.setStatus(SalesInvoice.InvoiceStatus.PARTIAL);
        } else if (invoice.getDueDate().isBefore(LocalDate.now())) {
            invoice.setStatus(SalesInvoice.InvoiceStatus.OVERDUE);
        }
    }

    private SalesInvoice toEntity(SalesInvoiceDTO dto) {
        return SalesInvoice.builder()
                .invoiceNumber(dto.getInvoiceNumber())
                .customerName(dto.getCustomerName())
                .customerCode(dto.getCustomerCode())
                .invoiceDate(dto.getInvoiceDate())
                .dueDate(dto.getDueDate())
                .currency(dto.getCurrency())
                .exchangeRate(dto.getExchangeRate())
                .amountForeign(dto.getAmountForeign())
                .amountInr(BigDecimal.ZERO)
                .receivedAmount(BigDecimal.ZERO)
                .outstandingAmount(BigDecimal.ZERO)
                .notes(dto.getNotes())
                .build();
    }

    private SalesInvoiceDTO toDTO(SalesInvoice s) {
        return SalesInvoiceDTO.builder()
                .id(s.getId())
                .invoiceNumber(s.getInvoiceNumber())
                .customerName(s.getCustomerName())
                .customerCode(s.getCustomerCode())
                .invoiceDate(s.getInvoiceDate())
                .dueDate(s.getDueDate())
                .currency(s.getCurrency())
                .exchangeRate(s.getExchangeRate())
                .amountForeign(s.getAmountForeign())
                .amountInr(s.getAmountInr())
                .receivedAmount(s.getReceivedAmount())
                .outstandingAmount(s.getOutstandingAmount())
                .status(s.getStatus())
                .notes(s.getNotes())
                .receipts(s.getReceipts().stream().map(this::toReceiptDTO).toList())
                .build();
    }

    private PaymentReceiptDTO toReceiptDTO(PaymentReceipt r) {
        return PaymentReceiptDTO.builder()
                .id(r.getId())
                .invoiceId(r.getInvoice().getId())
                .receiptDate(r.getReceiptDate())
                .amountForeign(r.getAmountForeign())
                .amountInr(r.getAmountInr())
                .exchangeRate(r.getExchangeRate())
                .bankReference(r.getBankReference())
                .notes(r.getNotes())
                .build();
    }
}
