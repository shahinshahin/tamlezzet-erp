package com.tamlezzet.erp.module.meeting.dto;

import com.tamlezzet.erp.module.meeting.entity.Meeting;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingDTO {
    private Long id;

    @NotBlank
    private String title;

    @NotNull
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;
    private String location;
    private String meetingLink;
    private String agenda;
    private String minutes;
    private String followUp;
    private Meeting.MeetingStatus status;
    private List<String> attendees;
    private List<String> attachmentUrls;
    private String voiceNoteUrl;
}
