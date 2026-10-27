package com.employee.attendance.dto.response;

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
public class DailyAttendanceSummaryDto {

    private LocalDate date;
    private long totalEmployees;
    private long presentCount;
    private long halfDayCount;
    private long onLeaveCount;
    private long absentCount;
    private List<AttendanceRecordResponseDto> records;
}
