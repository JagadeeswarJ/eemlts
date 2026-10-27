package com.employee.reporting.repository;

import com.employee.reporting.entity.AttendanceRecord;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;

@Repository
public interface AttendanceRecordRepository extends ReactiveCrudRepository<AttendanceRecord, Long> {

    Mono<AttendanceRecord> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    Flux<AttendanceRecord> findByAttendanceDate(LocalDate date);

    Flux<AttendanceRecord> findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
            Long employeeId,
            LocalDate start,
            LocalDate end
    );

    @Query("SELECT a.* FROM attendance_records a WHERE a.attendance_date BETWEEN :start AND :end")
    Flux<AttendanceRecord> findAllBetweenDates(LocalDate start, LocalDate end);
}
