package com.employee.attendance.repository;

import com.employee.attendance.entity.AttendanceRecord;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface AttendanceRecordRepository extends ReactiveCrudRepository<AttendanceRecord, Long> {

    Mono<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate attendanceDate);

    Flux<AttendanceRecord> findByEmployeeId(Long employeeId);

    Flux<AttendanceRecord> findByAttendanceDate(LocalDate attendanceDate);

    Flux<AttendanceRecord> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate
    );

    @Query("SELECT a.* FROM attendance_records a WHERE (:employeeId IS NULL OR a.employee_id = :employeeId) " +
           "AND (:startDate IS NULL OR a.attendance_date >= :startDate) " +
           "AND (:endDate IS NULL OR a.attendance_date <= :endDate) " +
           "AND (:status IS NULL OR a.status = :status) " +
           "ORDER BY a.attendance_date DESC, a.attendance_id DESC LIMIT :limit OFFSET :offset")
    Flux<AttendanceRecord> findFiltered(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            String status,
            long limit,
            long offset
    );

    @Query("SELECT COUNT(*) FROM attendance_records a WHERE (:employeeId IS NULL OR a.employee_id = :employeeId) " +
           "AND (:startDate IS NULL OR a.attendance_date >= :startDate) " +
           "AND (:endDate IS NULL OR a.attendance_date <= :endDate) " +
           "AND (:status IS NULL OR a.status = :status)")
    Mono<Long> countFiltered(
            Long employeeId,
            LocalDate startDate,
            LocalDate endDate,
            String status
    );
}
