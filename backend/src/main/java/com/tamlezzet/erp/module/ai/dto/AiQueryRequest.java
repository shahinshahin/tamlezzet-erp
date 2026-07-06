package com.tamlezzet.erp.module.ai.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AiQueryRequest {
    @NotBlank
    private String question;
    private String context;  // optional extra context
}
