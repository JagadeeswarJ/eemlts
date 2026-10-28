import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiResponse, CurrentUser, JwtResponse, LoginRequest } from '../models/auth.models';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'http://localhost:8080/api/v1/auth';

  login(request: LoginRequest): Observable<ApiResponse<JwtResponse>> {
    return this.http.post<ApiResponse<JwtResponse>>(`${this.baseUrl}/login`, request).pipe(
      tap((res) => {
        if (res.success && res.data && typeof window !== 'undefined') {
          localStorage.setItem('emp_access_token', res.data.accessToken);
          localStorage.setItem(
            'emp_user_profile',
            JSON.stringify({
              userId: res.data.userId,
              employeeId: res.data.employeeId,
              email: res.data.email,
              role: res.data.role,
              fullName: res.data.fullName,
            })
          );
        }
      })
    );
  }

  logout(): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('emp_access_token');
          localStorage.removeItem('emp_user_profile');
        }
      })
    );
  }

  getCurrentUser(): Observable<ApiResponse<CurrentUser>> {
    return this.http.get<ApiResponse<CurrentUser>>(`${this.baseUrl}/me`).pipe(
      tap((res) => {
        if (res.success && res.data && typeof window !== 'undefined') {
          localStorage.setItem('emp_user_profile', JSON.stringify(res.data));
        }
      })
    );
  }

  changePassword(passwords: { currentPassword: string; newPassword: string; confirmPassword: string }): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/change-password`, passwords);
  }

  forgotPassword(email: string): Observable<ApiResponse<string>> {
    return this.http.post<ApiResponse<string>>(`${this.baseUrl}/forgot-password`, { email });
  }

  getStoredUser(): CurrentUser | null {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('emp_user_profile');
      if (data) {
        try {
          return JSON.parse(data) as CurrentUser;
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
