package com.tamlezzet.erp.module.farmer.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "farmers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer extends BaseEntity {

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String village;

    private String taluka;
    private String district;
    private String state;

    @Column(unique = true)
    private String mobile;

    private String alternateMobile;

    private String cropName;
    private String cropVariety;

    @Column(length = 3)
    private String harvestMonth;  // e.g. "JAN", "FEB"

    private Integer harvestYear;

    @Column(precision = 3, scale = 1)
    private BigDecimal qualityRating;  // 1.0 - 5.0

    @Column(precision = 10, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 10, scale = 6)
    private BigDecimal longitude;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "farmer", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<FarmerPurchase> purchases = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "farmer_photos", joinColumns = @JoinColumn(name = "farmer_id"))
    @Column(name = "photo_url")
    @Builder.Default
    private List<String> photoUrls = new ArrayList<>();
}
