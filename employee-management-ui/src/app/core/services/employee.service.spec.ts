import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  UpdateSelfProfileRequest,
} from '../models/employee.models';
import { EmployeeService } from './employee.service';

describe('EmployeeService', () => {
  let service: EmployeeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        EmployeeService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(EmployeeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call GET /api/v1/employees with query params', () => {
    service.getEmployees({ departmentId: 1, status: 'ACTIVE', search: 'Alex', page: 0, size: 10 }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8080/api/v1/employees');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('departmentId')).toBe('1');
    expect(req.request.params.get('status')).toBe('ACTIVE');
    expect(req.request.params.get('search')).toBe('Alex');
    req.flush({ success: true, data: { content: [], totalElements: 0 } });
  });

  it('should call POST /api/v1/employees to create employee', () => {
    const newEmp: CreateEmployeeRequest = {
      firstName: 'Sarah',
      lastName: 'Smith',
      email: 'sarah@company.com',
      phone: '123',
      departmentId: 1,
      designation: 'Engineer',
      joiningDate: '2026-10-22',
      address: 'Street',
      emergencyContact: 'Contact',
    };

    service.createEmployee(newEmp).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/employees');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newEmp);
    req.flush({ success: true, data: { employeeId: 5, ...newEmp } });
  });

  it('should call PUT /api/v1/employees/:id to update employee', () => {
    const updateDto: UpdateEmployeeRequest = {
      firstName: 'Sarah',
      lastName: 'Connor',
      phone: '123',
      departmentId: 1,
      designation: 'Staff Engineer',
      address: 'Street',
      emergencyContact: 'Contact',
      employmentStatus: 'ACTIVE',
    };

    service.updateEmployee(5, updateDto).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/employees/5');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateDto);
    req.flush({ success: true, data: { employeeId: 5, ...updateDto } });
  });

  it('should call PUT /api/v1/employees/me/profile for self profile update', () => {
    const selfDto: UpdateSelfProfileRequest = {
      phone: '+1-555-9999',
      address: 'Pine St',
      emergencyContact: 'Contact',
    };

    service.updateSelfProfile(selfDto).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/employees/me/profile');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(selfDto);
    req.flush({ success: true, data: { employeeId: 4, ...selfDto } });
  });

  it('should call GET /api/v1/employees/:id and profile', () => {
    service.getEmployeeById(5).subscribe();
    const req1 = httpMock.expectOne('http://localhost:8080/api/v1/employees/5');
    expect(req1.request.method).toBe('GET');
    req1.flush({ success: true, data: { employeeId: 5 } });

    service.getEmployeeProfile(5).subscribe();
    const req2 = httpMock.expectOne('http://localhost:8080/api/v1/employees/5/profile');
    expect(req2.request.method).toBe('GET');
    req2.flush({ success: true, data: { employeeId: 5 } });
  });

  it('should call DELETE /api/v1/employees/:id to deactivate', () => {
    service.deactivateEmployee(5).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/employees/5');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, data: 'Deactivated' });
  });

  it('should call GET /api/v1/employees/managers and departments', () => {
    service.getManagers().subscribe();
    const req1 = httpMock.expectOne('http://localhost:8080/api/v1/employees/managers');
    expect(req1.request.method).toBe('GET');
    req1.flush({ success: true, data: [] });

    service.getDepartments().subscribe();
    const req2 = httpMock.expectOne('http://localhost:8080/api/v1/departments');
    expect(req2.request.method).toBe('GET');
    req2.flush({ success: true, data: [] });
  });
});
