package com.tamlezzet.erp.module.ai.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.module.ai.dto.AiQueryRequest;
import com.tamlezzet.erp.module.ai.service.AiAssistantService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
@Tag(name = "AI Assistant")
public class AiAssistantController {

    private final AiAssistantService aiService;

    @PostMapping("/query")
    public ResponseEntity<ApiResponse<String>> query(@Valid @RequestBody AiQueryRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
                aiService.query(request.getQuestion(), request.getContext())));
    }

    @PostMapping("/summarize-meeting")
    public ResponseEntity<ApiResponse<String>> summarizeMeeting(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                aiService.summarizeMeeting(body.get("notes"))));
    }

    @PostMapping("/payment-reminder")
    public ResponseEntity<ApiResponse<String>> paymentReminder(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                aiService.generatePaymentReminder(
                        body.get("customerName"), body.get("invoiceNumber"),
                        body.get("amount"), body.get("dueDate"))));
    }

    @PostMapping("/cashflow-prediction")
    public ResponseEntity<ApiResponse<String>> cashFlowPrediction(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                aiService.predictCashFlow(body.get("historicalData"))));
    }
}
