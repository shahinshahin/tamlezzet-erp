package com.tamlezzet.erp.module.export.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String shipmentNumber;

    @Column(nullable = false)
    private String buyerName;

    private String buyerCode;

    @Column(nullable = false)
    private String destinationCountry;

    private String destinationPort;
    private String originPort;

    private String containerNumber;
    private String vesselName;
    private String voyageNumber;

    private LocalDate shipmentDate;
    private LocalDate etd;    // Estimated Time of Departure
    private LocalDate eta;    // Estimated Time of Arrival
    private LocalDate actualArrival;

    private String invoiceNumber;
    private String shippingBillNumber;

    @Column(precision = 14, scale = 3)
    private BigDecimal netWeightKg;

    @Column(precision = 14, scale = 3)
    private BigDecimal grossWeightKg;

    @Column(precision = 14, scale = 2)
    private BigDecimal invoiceValueUsd;

    @Column(precision = 14, scale = 2)
    private BigDecimal freightCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ShipmentStatus status = ShipmentStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @ElementCollection
    @CollectionTable(name = "shipment_doc_urls", joinColumns = @JoinColumn(name = "shipment_id"))
    @Column(name = "doc_url")
    @Builder.Default
    private List<String> documentUrls = new ArrayList<>();

    @Column(length = 1000)
    private String notes;

    public enum ShipmentStatus {
        DRAFT, BOOKED, LOADING, SHIPPED, IN_TRANSIT, ARRIVED, DELIVERED, CANCELLED
    }

    public enum PaymentStatus {
        PENDING, PARTIAL, RECEIVED, OVERDUE
    }
}
