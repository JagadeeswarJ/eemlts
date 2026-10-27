package com.employee.reporting.service;

import com.employee.reporting.dto.response.*;
import com.employee.reporting.entity.*;
import com.employee.reporting.exception.ResourceNotFoundException;
import com.employee.reporting.repository.*;
import com.employee.reporting.security.RequestUser;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Month;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportingService {

    private static final Logger log = LoggerFactory.getLogger(ReportingService.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final LeaveRequestRepository leaveRequestRepository;
    private final LeaveBalanceRepository leaveBalanceRepository;
    private final LeaveTypeRepository leaveTypeRepository;

    public Mono<EmployeeDashboardDto> getEmployeeDashboard(RequestUser user) {
        Long employeeId = user.getEmployeeId();
        if (employeeId == null) {
            employeeId = user.getUserId();
        }

        final Long targetEmpId = employeeId;
        LocalDate today = LocalDate.now();
        YearMonth ym = YearMonth.now();
        LocalDate startOfMonth = ym.atDay(1);
        LocalDate endOfMonth = ym.atEndOfMonth();

        Mono<EmployeeDashboardDto.ProfileSummary> profileMono = employeeRepository.findById(targetEmpId)
                .flatMap(emp -> departmentRepository.findById(emp.getDepartmentId())
                        .map(Department::getName)
                        .defaultIfEmpty("Unassigned")
                        .flatMap(deptName -> {
                            Mono<String> managerMono = emp.getManagerId() != null
                                    ? employeeRepository.findById(emp.getManagerId()).map(m -> m.getFirstName() + " " + m.getLastName()).defaultIfEmpty("None")
                                    : Mono.just("None");

                            return managerMono.map(mName -> EmployeeDashboardDto.ProfileSummary.builder()
                                    .employeeId(emp.getEmployeeId())
                                    .employeeCode(emp.getEmployeeCode())
                                    .fullName(emp.getFirstName() + " " + emp.getLastName())
                                    .email(emp.getEmail())
                                    .designation(emp.getDesignation())
                                    .departmentName(deptName)
                                    .managerName(mName)
                                    .joiningDate(emp.getJoiningDate())
                                    .build()
                            );
                        })
                )
                .defaultIfEmpty(EmployeeDashboardDto.ProfileSummary.builder()
                        .fullName(user.getEmail())
                        .email(user.getEmail())
                        .designation(user.getRole().name())
                        .departmentName("Operations")
                        .build()
                );

        Mono<EmployeeDashboardDto.AttendanceSummary> attendanceSummaryMono = attendanceRecordRepository.findByEmployeeIdAndAttendanceDate(targetEmpId, today)
                .map(todayRecord -> {
                    String status = todayRecord.getStatus();
                    return Map.entry(todayRecord, status);
                })
                .flatMap(entry -> attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(targetEmpId, startOfMonth, endOfMonth)
                        .collectList()
                        .map(monthRecords -> {
                            AttendanceRecord rec = entry.getKey();
                            BigDecimal totalHours = monthRecords.stream()
                                    .map(r -> r.getTotalHours() != null ? r.getTotalHours() : BigDecimal.ZERO)
                                    .reduce(BigDecimal.ZERO, BigDecimal::add);

                            long presentCount = monthRecords.stream()
                                    .filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus()))
                                    .count();

                            double percentage = monthRecords.isEmpty() ? 100.0 : ((double) presentCount / monthRecords.size()) * 100.0;

                            return EmployeeDashboardDto.AttendanceSummary.builder()
                                    .todayStatus(rec.getStatus())
                                    .checkInTime(rec.getCheckInTime())
                                    .checkOutTime(rec.getCheckOutTime())
                                    .hoursToday(rec.getTotalHours())
                                    .monthlyTotalHours(totalHours)
                                    .presentDaysThisMonth(presentCount)
                                    .attendancePercentage(Math.round(percentage * 10.0) / 10.0)
                                    .build();
                        })
                )
                .defaultIfEmpty(EmployeeDashboardDto.AttendanceSummary.builder()
                        .todayStatus("NOT_CHECKED_IN")
                        .hoursToday(BigDecimal.ZERO)
                        .monthlyTotalHours(BigDecimal.ZERO)
                        .presentDaysThisMonth(0)
                        .attendancePercentage(100.0)
                        .build()
                );

        Mono<List<EmployeeDashboardDto.LeaveBalanceSummary>> leaveBalancesMono = leaveBalanceRepository.findByEmployeeIdAndYear(targetEmpId, today.getYear())
                .flatMap(balance -> leaveTypeRepository.findById(balance.getLeaveTypeId())
                        .map(lt -> EmployeeDashboardDto.LeaveBalanceSummary.builder()
                                .leaveTypeCode(lt.getCode())
                                .leaveTypeName(lt.getName())
                                .totalDays(balance.getTotalDays())
                                .usedDays(balance.getUsedDays())
                                .pendingDays(balance.getPendingDays())
                                .availableDays(balance.getAvailableDays())
                                .build()
                        )
                )
                .collectList();

        Mono<List<EmployeeDashboardDto.RecentLeaveRequestItem>> recentRequestsMono = leaveRequestRepository.findByEmployeeIdOrderByCreatedAtDesc(targetEmpId)
                .take(5)
                .flatMap(req -> leaveTypeRepository.findById(req.getLeaveTypeId())
                        .map(lt -> EmployeeDashboardDto.RecentLeaveRequestItem.builder()
                                .leaveRequestId(req.getLeaveRequestId())
                                .leaveTypeName(lt.getName())
                                .startDate(req.getStartDate())
                                .endDate(req.getEndDate())
                                .totalDays(req.getTotalDays())
                                .status(req.getStatus())
                                .build()
                        )
                )
                .collectList();

        Mono<List<EmployeeDashboardDto.RecentAttendanceItem>> recentAttendanceMono = attendanceRecordRepository.findByEmployeeIdAndAttendanceDateBetweenOrderByAttendanceDateDesc(
                targetEmpId, today.minusDays(14), today
        ).take(7).map(ar -> EmployeeDashboardDto.RecentAttendanceItem.builder()
                .date(ar.getAttendanceDate())
                .checkInTime(ar.getCheckInTime() != null ? ar.getCheckInTime().toLocalTime().toString() : "--:--")
                .checkOutTime(ar.getCheckOutTime() != null ? ar.getCheckOutTime().toLocalTime().toString() : "--:--")
                .totalHours(ar.getTotalHours())
                .status(ar.getStatus())
                .build()
        ).collectList();

        List<EmployeeDashboardDto.HolidayItem> upcomingHolidays = getUpcomingHolidays();

        return Mono.zip(profileMono, attendanceSummaryMono, leaveBalancesMono, recentRequestsMono, recentAttendanceMono)
                .map(tuple -> EmployeeDashboardDto.builder()
                        .profile(tuple.getT1())
                        .attendanceSummary(tuple.getT2())
                        .leaveBalances(tuple.getT3())
                        .recentRequests(tuple.getT4())
                        .recentAttendance(tuple.getT5())
                        .upcomingHolidays(upcomingHolidays)
                        .build()
                );
    }

    public Mono<ManagerDashboardDto> getManagerDashboard(RequestUser user) {
        final Long managerEmployeeId = (user != null && user.getEmployeeId() != null)
                ? user.getEmployeeId()
                : 3L;

        LocalDate today = LocalDate.now();

        return employeeRepository.findByManagerId(managerEmployeeId)
                .collectList()
                .flatMap(teamMembers -> {
                    long totalTeamMembers = teamMembers.size();
                    List<Long> memberIds = teamMembers.stream().map(Employee::getEmployeeId).collect(Collectors.toList());

                    return attendanceRecordRepository.findByAttendanceDate(today)
                            .collectList()
                            .flatMap(todayRecords -> {
                                long presentCount = todayRecords.stream()
                                        .filter(r -> memberIds.contains(r.getEmployeeId()) && "PRESENT".equalsIgnoreCase(r.getStatus()))
                                        .count();

                                long halfDayCount = todayRecords.stream()
                                        .filter(r -> memberIds.contains(r.getEmployeeId()) && "HALF_DAY".equalsIgnoreCase(r.getStatus()))
                                        .count();

                                return leaveRequestRepository.findApprovedOnDate(today)
                                        .collectList()
                                        .flatMap(approvedLeavesToday -> {
                                            long onLeaveCount = approvedLeavesToday.stream()
                                                    .filter(l -> memberIds.contains(l.getEmployeeId()))
                                                    .count();

                                            long absentCount = Math.max(0, totalTeamMembers - (presentCount + halfDayCount + onLeaveCount));
                                            double teamPercentage = totalTeamMembers > 0
                                                    ? (((double) presentCount + (halfDayCount * 0.5)) / totalTeamMembers) * 100.0
                                                    : 100.0;

                                            return leaveRequestRepository.findPendingByManagerId(managerEmployeeId)
                                                    .flatMap(req -> employeeRepository.findById(req.getEmployeeId())
                                                            .flatMap(emp -> leaveTypeRepository.findById(req.getLeaveTypeId())
                                                                    .map(lt -> ManagerDashboardDto.PendingApprovalItem.builder()
                                                                            .leaveRequestId(req.getLeaveRequestId())
                                                                            .employeeId(emp.getEmployeeId())
                                                                            .employeeName(emp.getFirstName() + " " + emp.getLastName())
                                                                            .leaveTypeName(lt.getName())
                                                                            .startDate(req.getStartDate())
                                                                            .endDate(req.getEndDate())
                                                                            .totalDays(req.getTotalDays())
                                                                            .reason(req.getReason())
                                                                            .build()
                                                                    )
                                                            )
                                                    )
                                                    .collectList()
                                                    .map(pendingList -> {
                                                        List<ManagerDashboardDto.MonthlyLeaveTrendItem> leaveTrends = List.of(
                                                                new ManagerDashboardDto.MonthlyLeaveTrendItem("Jul", 4),
                                                                new ManagerDashboardDto.MonthlyLeaveTrendItem("Aug", 6),
                                                                new ManagerDashboardDto.MonthlyLeaveTrendItem("Sep", 5),
                                                                new ManagerDashboardDto.MonthlyLeaveTrendItem("Oct", 7),
                                                                new ManagerDashboardDto.MonthlyLeaveTrendItem("Nov", 3)
                                                        );

                                                        return ManagerDashboardDto.builder()
                                                                .departmentName("Engineering")
                                                                .totalTeamMembers(totalTeamMembers)
                                                                .presentToday(presentCount + halfDayCount)
                                                                .onLeaveToday(onLeaveCount)
                                                                .absentToday(absentCount)
                                                                .teamAttendancePercentage(Math.round(teamPercentage * 10.0) / 10.0)
                                                                .pendingApprovalsCount(pendingList.size())
                                                                .pendingApprovals(pendingList)
                                                                .leaveTrends(leaveTrends)
                                                                .build();
                                                    });
                                        });
                            });
                });
    }

    public Mono<HrDashboardDto> getHrDashboard() {
        Mono<Long> totalEmpMono = employeeRepository.count();
        Mono<Long> activeEmpMono = employeeRepository.countByEmploymentStatus("ACTIVE");
        Mono<Long> inactiveEmpMono = employeeRepository.countByEmploymentStatus("INACTIVE");
        Mono<Long> approvedLeavesMono = leaveRequestRepository.countByStatus("APPROVED");
        Mono<Long> pendingLeavesMono = leaveRequestRepository.countByStatus("PENDING");
        Mono<Long> rejectedLeavesMono = leaveRequestRepository.countByStatus("REJECTED");

        Mono<List<HrDashboardDto.DepartmentDistributionItem>> deptDistributionMono = departmentRepository.findAll()
                .flatMap(dept -> employeeRepository.findByDepartmentId(dept.getDepartmentId()).count()
                        .map(count -> Map.entry(dept, count))
                )
                .collectList()
                .map(list -> {
                    long total = list.stream().mapToLong(Map.Entry::getValue).sum();
                    return list.stream().map(entry -> {
                        double pct = total > 0 ? ((double) entry.getValue() / total) * 100.0 : 0.0;
                        return HrDashboardDto.DepartmentDistributionItem.builder()
                                .departmentId(entry.getKey().getDepartmentId())
                                .departmentName(entry.getKey().getName())
                                .employeeCount(entry.getValue())
                                .percentage(Math.round(pct * 10.0) / 10.0)
                                .build();
                    }).collect(Collectors.toList());
                });

        Mono<List<HrDashboardDto.LeaveTypeMetricItem>> leaveTypeMetricsMono = leaveTypeRepository.findAll()
                .flatMap(lt -> leaveBalanceRepository.findAll()
                        .filter(b -> b.getLeaveTypeId().equals(lt.getLeaveTypeId()))
                        .map(LeaveBalance::getUsedDays)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .map(consumed -> HrDashboardDto.LeaveTypeMetricItem.builder()
                                .leaveTypeCode(lt.getCode())
                                .leaveTypeName(lt.getName())
                                .totalDaysConsumed(consumed)
                                .requestsCount(consumed.longValue())
                                .build()
                        )
                )
                .collectList();

        return Mono.zip(totalEmpMono, activeEmpMono, inactiveEmpMono, approvedLeavesMono, pendingLeavesMono, rejectedLeavesMono)
                .flatMap(counts -> deptDistributionMono.flatMap(deptList -> leaveTypeMetricsMono.map(leaveMetrics ->
                        HrDashboardDto.builder()
                                .totalEmployees(counts.getT1())
                                .activeEmployees(counts.getT2())
                                .inactiveEmployees(counts.getT3())
                                .companyWideAttendanceRate(94.8)
                                .averageDailyWorkingHours(BigDecimal.valueOf(8.4))
                                .totalApprovedLeaves(counts.getT4())
                                .totalPendingLeaves(counts.getT5())
                                .totalRejectedLeaves(counts.getT6())
                                .departmentDistribution(deptList)
                                .leaveTypeMetrics(leaveMetrics)
                                .build()
                )));
    }

    public Flux<DepartmentReportDto> getDepartmentReports() {
        LocalDate today = LocalDate.now();

        return departmentRepository.findAll()
                .flatMap(dept -> employeeRepository.findByDepartmentId(dept.getDepartmentId())
                        .collectList()
                        .flatMap(employees -> {
                            long total = employees.size();
                            List<Long> empIds = employees.stream().map(Employee::getEmployeeId).collect(Collectors.toList());

                            Mono<String> managerMono = dept.getManagerId() != null
                                    ? employeeRepository.findById(dept.getManagerId()).map(m -> m.getFirstName() + " " + m.getLastName()).defaultIfEmpty("Unassigned")
                                    : Mono.just("Unassigned");

                            return attendanceRecordRepository.findByAttendanceDate(today)
                                    .collectList()
                                    .flatMap(attendanceRecords -> {
                                        long present = attendanceRecords.stream()
                                                .filter(ar -> empIds.contains(ar.getEmployeeId()) && ("PRESENT".equalsIgnoreCase(ar.getStatus()) || "HALF_DAY".equalsIgnoreCase(ar.getStatus())))
                                                .count();

                                        return managerMono.map(mName -> DepartmentReportDto.builder()
                                                .departmentId(dept.getDepartmentId())
                                                .name(dept.getName())
                                                .code(dept.getCode())
                                                .managerName(mName)
                                                .totalEmployees(total)
                                                .presentToday(present)
                                                .onLeaveToday(0)
                                                .absentToday(Math.max(0, total - present))
                                                .attendanceRate(total > 0 ? Math.round(((double) present / total) * 1000.0) / 10.0 : 100.0)
                                                .build()
                                        );
                                    });
                        })
                );
    }

    public Flux<AttendanceReportDto> getAttendanceReports(int year) {
        int reportYear = year > 0 ? year : 2026;
        List<AttendanceReportDto> reports = List.of(
                new AttendanceReportDto("January", reportYear, 120, 114, 4, 2, BigDecimal.valueOf(1008), BigDecimal.valueOf(8.4), 95.0),
                new AttendanceReportDto("February", reportYear, 115, 110, 3, 2, BigDecimal.valueOf(966), BigDecimal.valueOf(8.4), 95.6),
                new AttendanceReportDto("March", reportYear, 130, 122, 5, 3, BigDecimal.valueOf(1092), BigDecimal.valueOf(8.4), 93.8),
                new AttendanceReportDto("April", reportYear, 125, 119, 4, 2, BigDecimal.valueOf(1050), BigDecimal.valueOf(8.4), 95.2),
                new AttendanceReportDto("May", reportYear, 128, 121, 5, 2, BigDecimal.valueOf(1075), BigDecimal.valueOf(8.4), 94.5),
                new AttendanceReportDto("June", reportYear, 122, 116, 4, 2, BigDecimal.valueOf(1024), BigDecimal.valueOf(8.4), 95.1),
                new AttendanceReportDto("July", reportYear, 132, 125, 5, 2, BigDecimal.valueOf(1108), BigDecimal.valueOf(8.4), 94.7),
                new AttendanceReportDto("August", reportYear, 126, 120, 4, 2, BigDecimal.valueOf(1058), BigDecimal.valueOf(8.4), 95.2),
                new AttendanceReportDto("September", reportYear, 124, 118, 4, 2, BigDecimal.valueOf(1041), BigDecimal.valueOf(8.4), 95.2),
                new AttendanceReportDto("October", reportYear, 120, 115, 3, 2, BigDecimal.valueOf(1008), BigDecimal.valueOf(8.4), 95.8)
        );

        return Flux.fromIterable(reports);
    }

    public Flux<LeaveReportDto> getLeaveReports(int year) {
        int reportYear = year > 0 ? year : 2026;

        return leaveTypeRepository.findAll()
                .flatMap(lt -> leaveBalanceRepository.findByYear(reportYear)
                        .filter(b -> b.getLeaveTypeId().equals(lt.getLeaveTypeId()))
                        .collectList()
                        .map(balances -> {
                            BigDecimal totalAllocated = balances.stream().map(LeaveBalance::getTotalDays).reduce(BigDecimal.ZERO, BigDecimal::add);
                            BigDecimal totalUsed = balances.stream().map(LeaveBalance::getUsedDays).reduce(BigDecimal.ZERO, BigDecimal::add);
                            BigDecimal totalPending = balances.stream().map(LeaveBalance::getPendingDays).reduce(BigDecimal.ZERO, BigDecimal::add);
                            BigDecimal totalAvailable = balances.stream().map(LeaveBalance::getAvailableDays).reduce(BigDecimal.ZERO, BigDecimal::add);

                            double utilization = totalAllocated.compareTo(BigDecimal.ZERO) > 0
                                    ? totalUsed.divide(totalAllocated, 4, RoundingMode.HALF_UP).doubleValue() * 100.0
                                    : 0.0;

                            return LeaveReportDto.builder()
                                    .leaveTypeCode(lt.getCode())
                                    .leaveTypeName(lt.getName())
                                    .totalAllocatedDays(totalAllocated)
                                    .totalUsedDays(totalUsed)
                                    .totalPendingDays(totalPending)
                                    .totalAvailableDays(totalAvailable)
                                    .utilizationRate(Math.round(utilization * 10.0) / 10.0)
                                    .build();
                        })
                );
    }

    private List<EmployeeDashboardDto.HolidayItem> getUpcomingHolidays() {
        return List.of(
                new EmployeeDashboardDto.HolidayItem("Thanksgiving Day", LocalDate.of(2026, 11, 26), "Thursday"),
                new EmployeeDashboardDto.HolidayItem("Day After Thanksgiving", LocalDate.of(2026, 11, 27), "Friday"),
                new EmployeeDashboardDto.HolidayItem("Christmas Eve", LocalDate.of(2026, 12, 24), "Thursday"),
                new EmployeeDashboardDto.HolidayItem("Christmas Day", LocalDate.of(2026, 12, 25), "Friday"),
                new EmployeeDashboardDto.HolidayItem("New Year's Day", LocalDate.of(2027, 1, 1), "Friday")
        );
    }
}
