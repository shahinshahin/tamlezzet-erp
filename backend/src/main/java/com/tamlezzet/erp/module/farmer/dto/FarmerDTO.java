package com.tamlezzet.erp.module.farmer.dto;

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
public class FarmerDTO {
    private Long id;

    @NotBlank
    private String fullName;

    @NotBlank
    private String village;

    private String taluka;
    private String district;
    private String state;
    private String mobile;
    private String alternateMobile;
    private String cropName;
    private String cropVariety;
    private String harvestMonth;
    private Integer harvestYear;
    private BigDecimal qualityRating;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private String notes;
    private boolean active;
    private List<String> photoUrls;
    private List<FarmerPurchaseDTO> purchases;
}
