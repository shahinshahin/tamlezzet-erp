package com.tamlezzet.erp.module.meeting.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.meeting.dto.MeetingDTO;
import com.tamlezzet.erp.module.meeting.entity.Meeting;
import com.tamlezzet.erp.module.meeting.repository.MeetingRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;

    @Transactional
    public MeetingDTO create(MeetingDTO dto) {
        return toDTO(meetingRepository.save(toEntity(dto)));
    }

    @Transactional
    public MeetingDTO update(Long id, MeetingDTO dto) {
        Meeting m = meetingRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found: " + id));
        m.setTitle(dto.getTitle());
        m.setScheduledAt(dto.getScheduledAt());
        m.setDurationMinutes(dto.getDurationMinutes());
        m.setLocation(dto.getLocation());
        m.setMeetingLink(dto.getMeetingLink());
        m.setAgenda(dto.getAgenda());
        m.setMinutes(dto.getMinutes());
        m.setFollowUp(dto.getFollowUp());
        if (dto.getStatus() != null) m.setStatus(dto.getStatus());
        if (dto.getAttendees() != null) m.setAttendees(dto.getAttendees());
        return toDTO(meetingRepository.save(m));
    }

    public MeetingDTO getById(Long id) {
        return meetingRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Meeting not found: " + id));
    }

    public PageResponseDTO<MeetingDTO> list(Pageable pageable) {
        Page<Meeting> page = meetingRepository.findAll(pageable);
        return PageResponseDTO.<MeetingDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<MeetingDTO> listUpcoming(int days) {
        return meetingRepository.findUpcoming(LocalDateTime.now(), LocalDateTime.now().plusDays(days))
                .stream().map(this::toDTO).toList();
    }

    private Meeting toEntity(MeetingDTO dto) {
        return Meeting.builder()
                .title(dto.getTitle())
                .scheduledAt(dto.getScheduledAt())
                .durationMinutes(dto.getDurationMinutes())
                .location(dto.getLocation())
                .meetingLink(dto.getMeetingLink())
                .agenda(dto.getAgenda())
                .minutes(dto.getMinutes())
                .followUp(dto.getFollowUp())
                .status(dto.getStatus() != null ? dto.getStatus() : Meeting.MeetingStatus.SCHEDULED)
                .attendees(dto.getAttendees() != null ? dto.getAttendees() : List.of())
                .build();
    }

    private MeetingDTO toDTO(Meeting m) {
        return MeetingDTO.builder()
                .id(m.getId())
                .title(m.getTitle())
                .scheduledAt(m.getScheduledAt())
                .durationMinutes(m.getDurationMinutes())
                .location(m.getLocation())
                .meetingLink(m.getMeetingLink())
                .agenda(m.getAgenda())
                .minutes(m.getMinutes())
                .followUp(m.getFollowUp())
                .status(m.getStatus())
                .attendees(m.getAttendees())
                .attachmentUrls(m.getAttachmentUrls())
                .voiceNoteUrl(m.getVoiceNoteUrl())
                .build();
    }
}
