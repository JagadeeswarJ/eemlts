import { Role } from './auth.models';

export type EmploymentStatus = 'ACTIVE' | 'INACTIVE' | 'TERMINATED' | 'ON_LEAVE';

export interface Employee {
  employeeId: number;
  userId: number;
  employeeCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  departmentId: number;
  departmentName: string;
  designation: string;
  joiningDate: string;
  employmentStatus: EmploymentStatus;
  managerId: number | null;
  managerName: string;
  address: string;
  emergencyContact: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: number;
  designation: string;
  joiningDate: string;
  managerId?: number | null;
  address: string;
  emergencyContact: string;
  role?: Role;
}

export interface UpdateEmployeeRequest {
  firstName: string;
  lastName: string;
  phone: string;
  departmentId: number;
  designation: string;
  managerId?: number | null;
  address: string;
  emergencyContact: string;
  employmentStatus?: EmploymentStatus;
}

export interface UpdateSelfProfileRequest {
  phone: string;
  address: string;
  emergencyContact: string;
}

export interface Department {
  departmentId: number;
  name: string;
  code: string;
  description: string;
  managerId: number | null;
  managerName: string;
  employeeCount: number;
  isActive?: boolean;
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  managerId?: number | null;
}

export interface UpdateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  managerId?: number | null;
}

export interface ManagerOption {
  employeeId: number;
  employeeCode: string;
  fullName: string;
  email: string;
  designation: string;
  departmentName: string;
}
