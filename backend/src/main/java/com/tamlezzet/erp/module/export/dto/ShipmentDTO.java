package com.tamlezzet.erp.module.export.dto;

import com.tamlezzet.erp.module.export.entity.Shipment;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentDTO {
    private Long id;

    @NotBlank
    private String shipmentNumber;

    @NotBlank
    private String buyerName;

    private String buyerCode;

    @NotBlank
    private String destinationCountry;

    private String destinationPort;
    private String originPort;
    private String containerNumber;
    private String vesselName;
    private String voyageNumber;
    private LocalDate shipmentDate;
    private LocalDate etd;
    private LocalDate eta;
    private LocalDate actualArrival;
    private String invoiceNumber;
    private String shippingBillNumber;
    private BigDecimal netWeightKg;
    private BigDecimal grossWeightKg;
    private BigDecimal invoiceValueUsd;
    private BigDecimal freightCost;
    private Shipment.ShipmentStatus status;
    private Shipment.PaymentStatus paymentStatus;
    private List<String> documentUrls;
    private String notes;
}
