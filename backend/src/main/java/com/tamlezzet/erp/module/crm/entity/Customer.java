package com.tamlezzet.erp.module.crm.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String customerCode;

    @Column(nullable = false)
    private String companyName;

    private String contactPerson;
    private String email;
    private String whatsapp;
    private String phone;

    @Column(nullable = false)
    private String country;

    private String city;
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private CustomerStage stage = CustomerStage.LEAD;

    @Column(length = 1000)
    private String notes;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @ElementCollection
    @CollectionTable(name = "customer_interested_products", joinColumns = @JoinColumn(name = "customer_id"))
    @Column(name = "product")
    @Builder.Default
    private List<String> interestedProducts = new ArrayList<>();

    public enum CustomerStage {
        LEAD, PROSPECT, SAMPLE_SENT, NEGOTIATION, BUYER, INACTIVE
    }
}
