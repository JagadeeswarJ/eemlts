export type Role = 'ADMIN' | 'HR' | 'MANAGER' | 'EMPLOYEE';

export interface CurrentUser {
  userId: number;
  employeeId: number | null;
  employeeCode: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  fullName: string;
  departmentId: number | null;
  departmentName: string;
  designation: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface JwtResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  userId: number;
  employeeId: number | null;
  email: string;
  role: Role;
  fullName: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  isFirst: boolean;
  isLast: boolean;
}
