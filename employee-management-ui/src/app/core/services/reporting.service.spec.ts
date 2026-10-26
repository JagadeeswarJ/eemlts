import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ReportingService } from './reporting.service';

describe('ReportingService', () => {
  let service: ReportingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ReportingService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(ReportingService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call GET /api/v1/reports/employee-dashboard', () => {
    service.getEmployeeDashboard().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/employee-dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('should call GET /api/v1/reports/manager-dashboard', () => {
    service.getManagerDashboard().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/manager-dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('should call GET /api/v1/reports/hr-dashboard', () => {
    service.getHrDashboard().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/hr-dashboard');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('should call GET /api/v1/reports/department-reports', () => {
    service.getDepartmentReports().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/department-reports');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/reports/attendance-reports with year', () => {
    service.getAttendanceReports(2026).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/attendance-reports?year=2026');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/reports/leave-reports with year', () => {
    service.getLeaveReports(2026).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/reports/leave-reports?year=2026');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
