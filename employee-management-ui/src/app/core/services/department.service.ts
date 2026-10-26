import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../models/employee.models';

@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/departments';

  getDepartments(): Observable<ApiResponse<Department[]>> {
    return this.http.get<ApiResponse<Department[]>>(this.baseUrl);
  }

  getDepartmentById(id: number): Observable<ApiResponse<Department>> {
    return this.http.get<ApiResponse<Department>>(`${this.baseUrl}/${id}`);
  }

  getDepartmentsAdmin(params?: {
    search?: string;
    isActive?: boolean;
    page?: number;
    size?: number;
  }): Observable<ApiResponse<PagedResponse<Department>>> {
    let httpParams = new HttpParams();
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.isActive !== undefined && params?.isActive !== null) {
      httpParams = httpParams.set('isActive', params.isActive.toString());
    }
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.size !== undefined) {
      httpParams = httpParams.set('size', params.size.toString());
    }
    return this.http.get<ApiResponse<PagedResponse<Department>>>(`${this.baseUrl}/admin`, {
      params: httpParams,
    });
  }

  createDepartment(req: CreateDepartmentRequest): Observable<ApiResponse<Department>> {
    return this.http.post<ApiResponse<Department>>(this.baseUrl, req);
  }

  updateDepartment(id: number, req: UpdateDepartmentRequest): Observable<ApiResponse<Department>> {
    return this.http.put<ApiResponse<Department>>(`${this.baseUrl}/${id}`, req);
  }

  updateDepartmentStatus(id: number, isActive: boolean): Observable<ApiResponse<Department>> {
    return this.http.patch<ApiResponse<Department>>(`${this.baseUrl}/${id}/status`, { isActive });
  }
}
