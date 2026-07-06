package com.tamlezzet.erp.module.crm.dto;

import com.tamlezzet.erp.module.crm.entity.Customer;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDTO {
    private Long id;
    private String customerCode;

    @NotBlank
    private String companyName;

    private String contactPerson;
    private String email;
    private String whatsapp;
    private String phone;

    @NotBlank
    private String country;

    private String city;
    private String address;
    private Customer.CustomerStage stage;
    private String notes;
    private boolean active;
    private List<String> interestedProducts;
}
