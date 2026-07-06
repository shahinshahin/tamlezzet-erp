package com.tamlezzet.erp.module.task.repository;

import com.tamlezzet.erp.module.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByAssignedTo(String email);
    List<Task> findByStatus(Task.TaskStatus status);
    List<Task> findByPriority(Task.Priority priority);

    @Query("SELECT t FROM Task t WHERE t.dueDate <= :date AND t.status NOT IN ('DONE','CANCELLED')")
    List<Task> findOverdue(@Param("date") LocalDate date);

    @Query("SELECT COUNT(t) FROM Task t WHERE t.status NOT IN ('DONE','CANCELLED')")
    long countPending();
}
