import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ApiResponse, PagedResponse } from '../models/auth.models';
import {
  CreateDepartmentRequest,
  Department,
  UpdateDepartmentRequest,
} from '../models/employee.models';
import { DepartmentService } from './department.service';

describe('DepartmentService', () => {
  let service: DepartmentService;
  let httpMock: HttpTestingController;

  const mockDept: Department = {
    departmentId: 1,
    name: 'Engineering',
    code: 'ENG',
    description: 'Software development',
    managerId: 3,
    managerName: 'David Miller',
    employeeCount: 4,
    isActive: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        DepartmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(DepartmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call GET /api/v1/departments and return active department list', () => {
    service.getDepartments().subscribe((res) => {
      expect(res.success).toBe(true);
      expect(res.data.length).toBe(1);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/departments');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [mockDept] });
  });

  it('should call GET /api/v1/departments/:id', () => {
    service.getDepartmentById(1).subscribe((res) => {
      expect(res.data.name).toBe('Engineering');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/departments/1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: mockDept });
  });

  it('should call GET /api/v1/departments/admin with search and pagination', () => {
    service
      .getDepartmentsAdmin({ search: 'Eng', isActive: true, page: 0, size: 10 })
      .subscribe((res) => {
        expect(res.data.totalElements).toBe(1);
      });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/v1/departments/admin?search=Eng&isActive=true&page=0&size=10'
    );
    expect(req.request.method).toBe('GET');
    req.flush({
      success: true,
      data: {
        content: [mockDept],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 10,
        isFirst: true,
        isLast: true,
      },
    });
  });

  it('should call POST /api/v1/departments to create department', () => {
    const createReq: CreateDepartmentRequest = {
      name: 'Legal',
      code: 'LEG',
      description: 'Legal team',
      managerId: 1,
    };

    service.createDepartment(createReq).subscribe((res) => {
      expect(res.data.code).toBe('LEG');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/departments');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createReq);
    req.flush({ success: true, data: { ...mockDept, code: 'LEG', name: 'Legal' } });
  });

  it('should call PUT /api/v1/departments/:id to update department', () => {
    const updateReq: UpdateDepartmentRequest = {
      name: 'Engineering Excellence',
      code: 'ENG',
    };

    service.updateDepartment(1, updateReq).subscribe((res) => {
      expect(res.data.name).toBe('Engineering Excellence');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/v1/departments/1');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { ...mockDept, name: 'Engineering Excellence' } });
  });

  it('should call PATCH /api/v1/departments/:id/status', () => {
    service.updateDepartmentStatus(1, false).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/departments/1/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ success: true, data: { ...mockDept, isActive: false } });
  });
});
