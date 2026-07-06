package com.tamlezzet.erp.module.task.service;

import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.task.dto.TaskDTO;
import com.tamlezzet.erp.module.task.entity.Task;
import com.tamlezzet.erp.module.task.repository.TaskRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TaskService {

    private final TaskRepository taskRepository;

    @Transactional
    public TaskDTO create(TaskDTO dto) {
        return toDTO(taskRepository.save(toEntity(dto)));
    }

    @Transactional
    public TaskDTO update(Long id, TaskDTO dto) {
        Task t = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
        t.setTitle(dto.getTitle());
        t.setDescription(dto.getDescription());
        t.setAssignedTo(dto.getAssignedTo());
        t.setPriority(dto.getPriority() != null ? dto.getPriority() : t.getPriority());
        t.setDueDate(dto.getDueDate());
        t.setNotes(dto.getNotes());
        return toDTO(taskRepository.save(t));
    }

    @Transactional
    public TaskDTO updateStatus(Long id, Task.TaskStatus status) {
        Task t = taskRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
        t.setStatus(status);
        if (status == Task.TaskStatus.DONE) t.setCompletedDate(LocalDate.now());
        return toDTO(taskRepository.save(t));
    }

    public TaskDTO getById(Long id) {
        return taskRepository.findById(id)
                .map(this::toDTO)
                .orElseThrow(() -> new EntityNotFoundException("Task not found: " + id));
    }

    public PageResponseDTO<TaskDTO> list(Pageable pageable) {
        Page<Task> page = taskRepository.findAll(pageable);
        return PageResponseDTO.<TaskDTO>builder()
                .content(page.getContent().stream().map(this::toDTO).toList())
                .page(page.getNumber()).size(page.getSize())
                .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
                .last(page.isLast()).build();
    }

    public List<TaskDTO> listByAssignee(String email) {
        return taskRepository.findByAssignedTo(email).stream().map(this::toDTO).toList();
    }

    public List<TaskDTO> listOverdue() {
        return taskRepository.findOverdue(LocalDate.now()).stream().map(this::toDTO).toList();
    }

    public long countPending() {
        return taskRepository.countPending();
    }

    private Task toEntity(TaskDTO dto) {
        return Task.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .assignedTo(dto.getAssignedTo())
                .assignedBy(dto.getAssignedBy())
                .priority(dto.getPriority() != null ? dto.getPriority() : Task.Priority.MEDIUM)
                .status(Task.TaskStatus.TODO)
                .dueDate(dto.getDueDate())
                .notes(dto.getNotes())
                .build();
    }

    private TaskDTO toDTO(Task t) {
        return TaskDTO.builder()
                .id(t.getId())
                .title(t.getTitle())
                .description(t.getDescription())
                .assignedTo(t.getAssignedTo())
                .assignedBy(t.getAssignedBy())
                .priority(t.getPriority())
                .status(t.getStatus())
                .dueDate(t.getDueDate())
                .completedDate(t.getCompletedDate())
                .notes(t.getNotes())
                .attachmentUrls(t.getAttachmentUrls())
                .build();
    }
}
