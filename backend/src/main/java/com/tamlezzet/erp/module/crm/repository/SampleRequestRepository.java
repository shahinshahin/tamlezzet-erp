package com.tamlezzet.erp.module.crm.repository;

import com.tamlezzet.erp.module.crm.entity.SampleRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SampleRequestRepository extends JpaRepository<SampleRequest, Long> {
    List<SampleRequest> findByCustomerId(Long customerId);
    List<SampleRequest> findByStatus(SampleRequest.SampleStatus status);
}
