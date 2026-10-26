import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AttendanceAuditLog,
  AttendanceCorrectionDecision,
  AttendanceCorrectionRequest,
  AttendanceRecord,
  AttendanceStats,
  DailyAttendanceSummary,
} from '../models/attendance.models';
import { ApiResponse, PagedResponse } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/attendance';

  checkIn(): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/check-in`, {});
  }

  checkOut(): Observable<ApiResponse<AttendanceRecord>> {
    return this.http.post<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/check-out`, {});
  }

  getTodayAttendance(employeeId?: number): Observable<ApiResponse<AttendanceRecord>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    return this.http.get<ApiResponse<AttendanceRecord>>(`${this.baseUrl}/today`, { params });
  }

  getAttendanceHistory(paramsObj?: {
    employeeId?: number;
    startDate?: string;
    endDate?: string;
    status?: string;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<AttendanceRecord>>> {
    let params = new HttpParams();
    if (paramsObj?.employeeId) {
      params = params.set('employeeId', paramsObj.employeeId.toString());
    }
    if (paramsObj?.startDate) {
      params = params.set('startDate', paramsObj.startDate);
    }
    if (paramsObj?.endDate) {
      params = params.set('endDate', paramsObj.endDate);
    }
    if (paramsObj?.status) {
      params = params.set('status', paramsObj.status);
    }
    if (paramsObj?.page !== undefined) {
      params = params.set('page', paramsObj.page.toString());
    }
    if (paramsObj?.size !== undefined) {
      params = params.set('size', paramsObj.size.toString());
    }

    return this.http.get<ApiResponse<PagedResponse<AttendanceRecord>>>(`${this.baseUrl}/history`, { params });
  }

  getDailyAttendance(date?: string, departmentId?: number): Observable<ApiResponse<DailyAttendanceSummary>> {
    let params = new HttpParams();
    if (date) {
      params = params.set('date', date);
    }
    if (departmentId) {
      params = params.set('departmentId', departmentId.toString());
    }
    return this.http.get<ApiResponse<DailyAttendanceSummary>>(`${this.baseUrl}/daily`, { params });
  }

  getMonthlyAttendance(employeeId?: number, year?: number, month?: number): Observable<ApiResponse<AttendanceRecord[]>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<ApiResponse<AttendanceRecord[]>>(`${this.baseUrl}/monthly`, { params });
  }

  getAttendanceStats(employeeId?: number, year?: number, month?: number): Observable<ApiResponse<AttendanceStats>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    if (month) {
      params = params.set('month', month.toString());
    }
    return this.http.get<ApiResponse<AttendanceStats>>(`${this.baseUrl}/stats`, { params });
  }

  requestCorrection(request: AttendanceCorrectionRequest): Observable<ApiResponse<AttendanceAuditLog>> {
    return this.http.post<ApiResponse<AttendanceAuditLog>>(`${this.baseUrl}/corrections`, request);
  }

  processCorrection(auditId: number, decision: AttendanceCorrectionDecision): Observable<ApiResponse<AttendanceAuditLog>> {
    return this.http.put<ApiResponse<AttendanceAuditLog>>(`${this.baseUrl}/corrections/${auditId}`, decision);
  }

  getAuditLogs(employeeId?: number): Observable<ApiResponse<AttendanceAuditLog[]>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    return this.http.get<ApiResponse<AttendanceAuditLog[]>>(`${this.baseUrl}/audit-logs`, { params });
  }
}
