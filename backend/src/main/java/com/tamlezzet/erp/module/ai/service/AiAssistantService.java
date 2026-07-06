package com.tamlezzet.erp.module.ai.service;

import org.springframework.stereotype.Service;

@Service
public class AiAssistantService {

    public String query(String question, String additionalContext) {
        return "AI features are disabled. Please configure OPENAI_API_KEY to enable.";
    }

    public String summarizeMeeting(String meetingNotes) {
        return "AI features are disabled. Please configure OPENAI_API_KEY to enable.";
    }

    public String generatePaymentReminder(String customerName, String invoiceNumber,
                                           String amount, String dueDate) {
        return "AI features are disabled. Please configure OPENAI_API_KEY to enable.";
    }

    public String predictCashFlow(String historicalData) {
        return "AI features are disabled. Please configure OPENAI_API_KEY to enable.";
    }
}
