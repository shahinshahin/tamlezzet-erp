package com.tamlezzet.erp.module.meeting.entity;

import com.tamlezzet.erp.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "meetings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private LocalDateTime scheduledAt;

    private Integer durationMinutes;

    private String location;
    private String meetingLink;

    @Column(length = 2000)
    private String agenda;

    @Column(length = 4000)
    private String minutes;

    @Column(length = 2000)
    private String followUp;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MeetingStatus status = MeetingStatus.SCHEDULED;

    @ElementCollection
    @CollectionTable(name = "meeting_attendees", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "attendee")
    @Builder.Default
    private List<String> attendees = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "meeting_attachment_urls", joinColumns = @JoinColumn(name = "meeting_id"))
    @Column(name = "attachment_url")
    @Builder.Default
    private List<String> attachmentUrls = new ArrayList<>();

    private String voiceNoteUrl;

    public enum MeetingStatus {
        SCHEDULED, COMPLETED, CANCELLED, POSTPONED
    }
}
