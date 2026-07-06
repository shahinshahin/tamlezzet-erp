package com.tamlezzet.erp.module.manufacturer.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "manufacturers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Manufacturer extends BaseEntity {

    @Column(nullable = false)
    private String companyName;

    private String contactPerson;
    private String email;
    private String phone;
    private String address;
    private String city;
    private String state;
    private String gstNumber;

    @Column(precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(precision = 10, scale = 2)
    private BigDecimal moqKg;   // Minimum Order Quantity

    private Integer leadTimeDays;

    @Column(precision = 3, scale = 1)
    private BigDecimal qualityScore;  // 1.0 - 5.0

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ElementCollection
    @CollectionTable(name = "manufacturer_certifications", joinColumns = @JoinColumn(name = "manufacturer_id"))
    @Column(name = "certification")
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "manufacturer_agreement_urls", joinColumns = @JoinColumn(name = "manufacturer_id"))
    @Column(name = "doc_url")
    @Builder.Default
    private List<String> agreementUrls = new ArrayList<>();
}
