package com.employee.reporting.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepartmentReportDto {

    private Long departmentId;
    private String name;
    private String code;
    private String managerName;
    private long totalEmployees;
    private long presentToday;
    private long onLeaveToday;
    private long absentToday;
    private double attendanceRate;
}
