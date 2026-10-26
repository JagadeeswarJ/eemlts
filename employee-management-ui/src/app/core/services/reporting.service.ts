import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/auth.models';
import {
  AttendanceReport,
  DepartmentReport,
  EmployeeDashboard,
  HrDashboard,
  LeaveReport,
  ManagerDashboard,
} from '../models/report.models';

@Injectable({
  providedIn: 'root',
})
export class ReportingService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/reports';

  getEmployeeDashboard(): Observable<ApiResponse<EmployeeDashboard>> {
    return this.http.get<ApiResponse<EmployeeDashboard>>(`${this.baseUrl}/employee-dashboard`);
  }

  getManagerDashboard(): Observable<ApiResponse<ManagerDashboard>> {
    return this.http.get<ApiResponse<ManagerDashboard>>(`${this.baseUrl}/manager-dashboard`);
  }

  getHrDashboard(): Observable<ApiResponse<HrDashboard>> {
    return this.http.get<ApiResponse<HrDashboard>>(`${this.baseUrl}/hr-dashboard`);
  }

  getDepartmentReports(): Observable<ApiResponse<DepartmentReport[]>> {
    return this.http.get<ApiResponse<DepartmentReport[]>>(`${this.baseUrl}/department-reports`);
  }

  getAttendanceReports(year?: number): Observable<ApiResponse<AttendanceReport[]>> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<ApiResponse<AttendanceReport[]>>(`${this.baseUrl}/attendance-reports`, { params });
  }

  getLeaveReports(year?: number): Observable<ApiResponse<LeaveReport[]>> {
    let params = new HttpParams();
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<ApiResponse<LeaveReport[]>>(`${this.baseUrl}/leave-reports`, { params });
  }
}
