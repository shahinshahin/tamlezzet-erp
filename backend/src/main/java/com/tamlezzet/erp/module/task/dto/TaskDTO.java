package com.tamlezzet.erp.module.task.dto;

import com.tamlezzet.erp.module.task.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskDTO {
    private Long id;

    @NotBlank
    private String title;

    private String description;

    @NotBlank
    private String assignedTo;

    private String assignedBy;
    private Task.Priority priority;
    private Task.TaskStatus status;

    @NotNull
    private LocalDate dueDate;

    private LocalDate completedDate;
    private String notes;
    private List<String> attachmentUrls;
}
