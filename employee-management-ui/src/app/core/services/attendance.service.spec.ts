import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { AttendanceCorrectionDecision, AttendanceCorrectionRequest } from '../models/attendance.models';
import { AttendanceService } from './attendance.service';

describe('AttendanceService', () => {
  let service: AttendanceService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AttendanceService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(AttendanceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call POST /api/v1/attendance/check-in', () => {
    service.checkIn().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/check-in');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { attendanceId: 101, status: 'PRESENT' } });
  });

  it('should call POST /api/v1/attendance/check-out', () => {
    service.checkOut().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/check-out');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { attendanceId: 101, totalHours: 8.5 } });
  });

  it('should call GET /api/v1/attendance/today with employeeId', () => {
    service.getTodayAttendance(4).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/today?employeeId=4');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { employeeId: 4, canCheckIn: false } });
  });

  it('should call GET /api/v1/attendance/history with query parameters', () => {
    service
      .getAttendanceHistory({
        employeeId: 4,
        startDate: '2026-10-01',
        endDate: '2026-10-22',
        status: 'PRESENT',
        page: 0,
        size: 10,
      })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8080/api/v1/attendance/history');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('employeeId')).toBe('4');
    expect(req.request.params.get('startDate')).toBe('2026-10-01');
    expect(req.request.params.get('endDate')).toBe('2026-10-22');
    expect(req.request.params.get('status')).toBe('PRESENT');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({ success: true, data: { content: [], totalElements: 0 } });
  });

  it('should call GET /api/v1/attendance/daily with date and departmentId', () => {
    service.getDailyAttendance('2026-10-22', 1).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/daily?date=2026-10-22&departmentId=1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('should call GET /api/v1/attendance/monthly with employeeId, year, and month', () => {
    service.getMonthlyAttendance(4, 2026, 10).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/monthly?employeeId=4&year=2026&month=10');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/attendance/stats with year and month', () => {
    service.getAttendanceStats(4, 2026, 10).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/stats?employeeId=4&year=2026&month=10');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: {} });
  });

  it('should call POST /api/v1/attendance/corrections to submit request', () => {
    const correction: AttendanceCorrectionRequest = {
      attendanceDate: '2026-10-22',
      proposedCheckInTime: '2026-10-22T09:00:00',
      reason: 'Biometric error',
    };

    service.requestCorrection(correction).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/corrections');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(correction);
    req.flush({ success: true, data: { auditId: 10 } });
  });

  it('should call PUT /api/v1/attendance/corrections/:id with decision', () => {
    const decision: AttendanceCorrectionDecision = {
      approved: true,
      comment: 'Approved',
    };

    service.processCorrection(10, decision).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/corrections/10');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(decision);
    req.flush({ success: true, data: { auditId: 10 } });
  });

  it('should call GET /api/v1/attendance/audit-logs with employeeId', () => {
    service.getAuditLogs(4).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/attendance/audit-logs?employeeId=4');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
