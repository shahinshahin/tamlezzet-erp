package com.tamlezzet.erp.module.meeting.repository;

import com.tamlezzet.erp.module.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface MeetingRepository extends JpaRepository<Meeting, Long>, JpaSpecificationExecutor<Meeting> {
    List<Meeting> findByStatus(Meeting.MeetingStatus status);

    @Query("SELECT m FROM Meeting m WHERE m.scheduledAt BETWEEN :start AND :end ORDER BY m.scheduledAt")
    List<Meeting> findUpcoming(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}
