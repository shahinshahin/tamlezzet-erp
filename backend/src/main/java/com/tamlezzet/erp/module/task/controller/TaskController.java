package com.tamlezzet.erp.module.task.controller;

import com.tamlezzet.erp.common.dto.ApiResponse;
import com.tamlezzet.erp.common.dto.PageResponseDTO;
import com.tamlezzet.erp.module.task.dto.TaskDTO;
import com.tamlezzet.erp.module.task.entity.Task;
import com.tamlezzet.erp.module.task.service.TaskService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
@Tag(name = "Task Management")
public class TaskController {

    private final TaskService service;

    @PostMapping
    public ResponseEntity<ApiResponse<TaskDTO>> create(@Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.create(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> update(@PathVariable Long id, @Valid @RequestBody TaskDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(service.update(id, dto)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TaskDTO>> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(ApiResponse.ok(
                service.updateStatus(id, Task.TaskStatus.valueOf(body.get("status")))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TaskDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(service.getById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<TaskDTO>>> list(Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(service.list(pageable)));
    }

    @GetMapping("/assignee/{email}")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> byAssignee(@PathVariable String email) {
        return ResponseEntity.ok(ApiResponse.ok(service.listByAssignee(email)));
    }

    @GetMapping("/overdue")
    public ResponseEntity<ApiResponse<List<TaskDTO>>> overdue() {
        return ResponseEntity.ok(ApiResponse.ok(service.listOverdue()));
    }
}
