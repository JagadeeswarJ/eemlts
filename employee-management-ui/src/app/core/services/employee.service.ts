import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import {
  CreateEmployeeRequest,
  Department,
  Employee,
  ManagerOption,
  UpdateEmployeeRequest,
  UpdateSelfProfileRequest,
} from '../models/employee.models';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/employees';
  private readonly deptUrl = 'http://localhost:8080/api/v1/departments';

  createEmployee(request: CreateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(this.baseUrl, request);
  }

  updateEmployee(id: number, request: UpdateEmployeeRequest): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/${id}`, request);
  }

  updateSelfProfile(request: UpdateSelfProfileRequest): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.baseUrl}/me/profile`, request);
  }

  getEmployeeById(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.baseUrl}/${id}`);
  }

  getEmployeeProfile(id: number): Observable<ApiResponse<Employee>> {
    return this.http.get<ApiResponse<Employee>>(`${this.baseUrl}/${id}/profile`);
  }

  getEmployees(paramsObj?: {
    departmentId?: number;
    status?: string;
    search?: string;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<Employee>>> {
    let params = new HttpParams();
    if (paramsObj?.departmentId) {
      params = params.set('departmentId', paramsObj.departmentId.toString());
    }
    if (paramsObj?.status) {
      params = params.set('status', paramsObj.status);
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

    return this.http.get<ApiResponse<PagedResponse<Employee>>>(this.baseUrl, { params });
  }

  deactivateEmployee(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.baseUrl}/${id}`);
  }

  getManagers(): Observable<ApiResponse<ManagerOption[]>> {
    return this.http.get<ApiResponse<ManagerOption[]>>(`${this.baseUrl}/managers`);
  }

  getDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(this.deptUrl);
  }
}
