package com.tamlezzet.erp.module.crm.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.crm.dto.CustomerDTO;
import com.tamlezzet.erp.module.crm.entity.Customer;
import com.tamlezzet.erp.module.crm.repository.CustomerRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerDTO create(CustomerDTO dto) {
        if (dto.getCustomerCode() == null || dto.getCustomerCode().isBlank()) {
            dto.setCustomerCode("CUST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        }
        return toDTO(customerRepository.save(toEntity(dto)));
    }

    @Transactional
    public CustomerDTO update(Long id, CustomerDTO dto) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
        c.setCompanyName(dto.getCompanyName());
        c.setContactPerson(dto.getContactPerson());
        c.setEmail(dto.getEmail());
        c.setWhatsapp(dto.getWhatsapp());
        c.setPhone(dto.getPhone());
        c.setCountry(dto.getCountry());
        c.setCity(dto.getCity());
        c.setAddress(dto.getAddress());
        c.setStage(dto.getStage() != null ? dto.getStage() : c.getStage());
        c.setNotes(dto.getNotes());
        if (dto.getInterestedProducts() != null) c.setInterestedProducts(dto.getInterestedProducts());
        return toDTO(customerRepository.save(c));
    }

    @Transactional
    public CustomerDTO updateStage(Long id, Customer.CustomerStage stage) {
        Customer c = customerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
        c.setStage(stage);
        return toDTO(customerRepository.save(c));
    }

    public CustomerDTO getById(Long id) {
        return customerRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found: " + id));
    }

    public PageResponseDTO<CustomerDTO> list(Pageable pageable) {
        Page<Customer> page = customerRepository.findAll(pageable);
        return PageResponseDTO.<CustomerDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<CustomerDTO> listByStage(Customer.CustomerStage stage) {
        return customerRepository.findByStage(stage).stream().map(this::toDTO).toList();
    }

    private Customer toEntity(CustomerDTO dto) {
        return Customer.builder()
                .customerCode(dto.getCustomerCode())
                .companyName(dto.getCompanyName())
                .contactPerson(dto.getContactPerson())
                .email(dto.getEmail())
                .whatsapp(dto.getWhatsapp())
                .phone(dto.getPhone())
                .country(dto.getCountry())
                .city(dto.getCity())
                .address(dto.getAddress())
                .stage(dto.getStage() != null ? dto.getStage() : Customer.CustomerStage.LEAD)
                .notes(dto.getNotes())
                .interestedProducts(dto.getInterestedProducts() != null ? dto.getInterestedProducts() : List.of())
                .build();
    }

    private CustomerDTO toDTO(Customer c) {
        return CustomerDTO.builder()
                .id(c.getId())
                .customerCode(c.getCustomerCode())
                .companyName(c.getCompanyName())
                .contactPerson(c.getContactPerson())
                .email(c.getEmail())
                .whatsapp(c.getWhatsapp())
                .phone(c.getPhone())
                .country(c.getCountry())
                .city(c.getCity())
                .address(c.getAddress())
                .stage(c.getStage())
                .notes(c.getNotes())
                .active(c.isActive())
                .interestedProducts(c.getInterestedProducts())
                .build();
    }
}
