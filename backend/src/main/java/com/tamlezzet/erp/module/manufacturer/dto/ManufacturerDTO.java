package com.tamlezzet.erp.module.manufacturer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManufacturerDTO {
    private Long id;

    @NotBlank
    private String companyName;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String gstNumber;
    private BigDecimal pricePerKg;
    private BigDecimal moqKg;
    private Integer leadTimeDays;
    private BigDecimal qualityScore;
    private String notes;
    private boolean active;
    private List<String> certifications;
    private List<String> agreementUrls;
}
