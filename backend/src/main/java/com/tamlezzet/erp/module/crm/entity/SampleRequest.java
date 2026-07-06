package com.tamlezzet.erp.module.crm.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "sample_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SampleRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Column(nullable = false)
    private String productName;

    private String specification;

    @Column(nullable = false)
    private LocalDate requestDate;

    private LocalDate dispatchDate;
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private SampleStatus status = SampleStatus.REQUESTED;

    private String feedback;
    private String notes;

    public enum SampleStatus {
        REQUESTED, DISPATCHED, DELIVERED, APPROVED, REJECTED
    }
}
