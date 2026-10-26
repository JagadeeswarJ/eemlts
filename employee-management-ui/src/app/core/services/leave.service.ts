import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import {
  AdminLeaveBalance,
  AdjustLeaveBalanceRequest,
  ApplyLeaveRequest,
  CreateLeaveTypeRequest,
  LeaveBalance,
  LeaveBalanceAdjustment,
  LeaveDecisionRequest,
  LeaveRequest,
  LeaveType,
  TeamLeaveCalendarItem,
  UpdateLeaveTypeRequest,
} from '../models/leave.models';

@Injectable({
  providedIn: 'root',
})
export class LeaveService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/leaves';

  getLeaveTypes(): Observable<ApiResponse<LeaveType[]>> {
    return this.http.get<ApiResponse<LeaveType[]>>(`${this.baseUrl}/types`);
  }

  getLeaveTypesAdmin(paramsObj?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<LeaveType>>> {
    let params = new HttpParams();
    if (paramsObj?.search) {
      params = params.set('search', paramsObj.search);
    }
    if (paramsObj?.isActive !== undefined && paramsObj?.isActive !== null) {
      params = params.set('isActive', paramsObj.isActive.toString());
    }
    if (paramsObj?.page !== undefined) {
      params = params.set('page', paramsObj.page.toString());
    }
    if (paramsObj?.size !== undefined) {
      params = params.set('size', paramsObj.size.toString());
    }
    return this.http.get<ApiResponse<PagedResponse<LeaveType>>>(`${this.baseUrl}/admin/types`, { params });
  }

  createLeaveType(request: CreateLeaveTypeRequest): Observable<ApiResponse<LeaveType>> {
    return this.http.post<ApiResponse<LeaveType>>(`${this.baseUrl}/admin/types`, request);
  }

  updateLeaveType(id: number, request: UpdateLeaveTypeRequest): Observable<ApiResponse<LeaveType>> {
    return this.http.put<ApiResponse<LeaveType>>(`${this.baseUrl}/admin/types/${id}`, request);
  }

  updateLeaveTypeStatus(id: number, isActive: boolean): Observable<ApiResponse<LeaveType>> {
    return this.http.patch<ApiResponse<LeaveType>>(`${this.baseUrl}/admin/types/${id}/status`, { isActive });
  }

  getAdminBalances(paramsObj?: {
    employeeId?: number;
    departmentId?: number;
    year?: number;
    leaveTypeId?: number;
    search?: string;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<AdminLeaveBalance>>> {
    let params = new HttpParams();
    if (paramsObj?.employeeId) {
      params = params.set('employeeId', paramsObj.employeeId.toString());
    }
    if (paramsObj?.departmentId) {
      params = params.set('departmentId', paramsObj.departmentId.toString());
    }
    if (paramsObj?.year) {
      params = params.set('year', paramsObj.year.toString());
    }
    if (paramsObj?.leaveTypeId) {
      params = params.set('leaveTypeId', paramsObj.leaveTypeId.toString());
    }
    if (paramsObj?.search) {
      params = params.set('search', paramsObj.search);
    }
    if (paramsObj?.page !== undefined) {
      params = params.set('page', paramsObj.page.toString());
    }
    if (paramsObj?.size !== undefined) {
      params = params.set('size', paramsObj.size.toString());
    }
    return this.http.get<ApiResponse<PagedResponse<AdminLeaveBalance>>>(`${this.baseUrl}/admin/balances`, { params });
  }

  adjustLeaveAllocation(
    employeeId: number,
    leaveTypeId: number,
    request: AdjustLeaveBalanceRequest
  ): Observable<ApiResponse<AdminLeaveBalance>> {
    return this.http.put<ApiResponse<AdminLeaveBalance>>(
      `${this.baseUrl}/admin/balances/${employeeId}/${leaveTypeId}`,
      request
    );
  }

  getBalanceAdjustments(employeeId?: number): Observable<ApiResponse<LeaveBalanceAdjustment[]>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    return this.http.get<ApiResponse<LeaveBalanceAdjustment[]>>(`${this.baseUrl}/admin/balance-adjustments`, {
      params,
    });
  }

  getLeaveBalances(employeeId?: number, year?: number): Observable<ApiResponse<LeaveBalance[]>> {
    let params = new HttpParams();
    if (employeeId) {
      params = params.set('employeeId', employeeId.toString());
    }
    if (year) {
      params = params.set('year', year.toString());
    }
    return this.http.get<ApiResponse<LeaveBalance[]>>(`${this.baseUrl}/balances`, { params });
  }

  applyLeave(request: ApplyLeaveRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.post<ApiResponse<LeaveRequest>>(`${this.baseUrl}/apply`, request);
  }

  cancelLeave(leaveRequestId: number): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${leaveRequestId}/cancel`, {});
  }

  approveLeave(leaveRequestId: number, decision?: LeaveDecisionRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${leaveRequestId}/approve`, decision || {});
  }

  rejectLeave(leaveRequestId: number, decision?: LeaveDecisionRequest): Observable<ApiResponse<LeaveRequest>> {
    return this.http.put<ApiResponse<LeaveRequest>>(`${this.baseUrl}/${leaveRequestId}/reject`, decision || {});
  }

  getLeaveHistory(paramsObj?: {
    employeeId?: number;
    status?: string;
    year?: number;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<LeaveRequest>>> {
    let params = new HttpParams();
    if (paramsObj?.employeeId) {
      params = params.set('employeeId', paramsObj.employeeId.toString());
    }
    if (paramsObj?.status) {
      params = params.set('status', paramsObj.status);
    }
    if (paramsObj?.year) {
      params = params.set('year', paramsObj.year.toString());
    }
    if (paramsObj?.page !== undefined) {
      params = params.set('page', paramsObj.page.toString());
    }
    if (paramsObj?.size !== undefined) {
      params = params.set('size', paramsObj.size.toString());
    }

    return this.http.get<ApiResponse<PagedResponse<LeaveRequest>>>(`${this.baseUrl}/history`, { params });
  }

  getPendingApprovals(): Observable<ApiResponse<LeaveRequest[]>> {
    return this.http.get<ApiResponse<LeaveRequest[]>>(`${this.baseUrl}/pending`);
  }

  getTeamLeaveCalendar(startDate?: string, endDate?: string, departmentId?: number): Observable<ApiResponse<TeamLeaveCalendarItem[]>> {
    let params = new HttpParams();
    if (startDate) {
      params = params.set('startDate', startDate);
    }
    if (endDate) {
      params = params.set('endDate', endDate);
    }
    if (departmentId) {
      params = params.set('departmentId', departmentId.toString());
    }
    return this.http.get<ApiResponse<TeamLeaveCalendarItem[]>>(`${this.baseUrl}/calendar`, { params });
  }
}
