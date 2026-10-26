import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  AdjustLeaveBalanceRequest,
  CreateLeaveTypeRequest,
  UpdateLeaveTypeRequest,
} from '../models/leave.models';
import { LeaveService } from './leave.service';

describe('LeaveService', () => {
  let service: LeaveService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        LeaveService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });

    service = TestBed.inject(LeaveService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should call GET /api/v1/leaves/types', () => {
    service.getLeaveTypes().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/types');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/leaves/admin/types with search and filter', () => {
    service.getLeaveTypesAdmin({ search: 'Casual', isActive: true, page: 0, size: 10 }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/types?search=Casual&isActive=true&page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: [], totalElements: 0 } });
  });

  it('should call POST /api/v1/leaves/admin/types', () => {
    const createReq: CreateLeaveTypeRequest = {
      code: 'COMPENSATORY',
      name: 'Comp Off',
      annualQuota: 5,
    };
    service.createLeaveType(createReq).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/types');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(createReq);
    req.flush({ success: true, data: { leaveTypeId: 5, ...createReq } });
  });

  it('should call PUT /api/v1/leaves/admin/types/:id', () => {
    const updateReq: UpdateLeaveTypeRequest = {
      name: 'Compensatory Leave',
      annualQuota: 6,
    };
    service.updateLeaveType(5, updateReq).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/types/5');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { leaveTypeId: 5, ...updateReq } });
  });

  it('should call PATCH /api/v1/leaves/admin/types/:id/status', () => {
    service.updateLeaveTypeStatus(5, false).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/types/5/status');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ success: true, data: { leaveTypeId: 5, isActive: false } });
  });

  it('should call GET /api/v1/leaves/admin/balances with parameters', () => {
    service.getAdminBalances({ employeeId: 4, year: 2026, page: 0, size: 10 }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/balances?employeeId=4&year=2026&page=0&size=10');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { content: [], totalElements: 0 } });
  });

  it('should call PUT /api/v1/leaves/admin/balances/:employeeId/:leaveTypeId to adjust allocation', () => {
    const adjReq: AdjustLeaveBalanceRequest = {
      year: 2026,
      newTotal: 15,
      reason: 'Mid-year quota adjustment',
    };
    service.adjustLeaveAllocation(4, 1, adjReq).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/balances/4/1');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(adjReq);
    req.flush({ success: true, data: { balanceId: 1, totalDays: 15 } });
  });

  it('should call GET /api/v1/leaves/admin/balance-adjustments', () => {
    service.getBalanceAdjustments(4).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/admin/balance-adjustments?employeeId=4');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/leaves/balances with employeeId and year', () => {
    service.getLeaveBalances(4, 2026).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/balances?employeeId=4&year=2026');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call POST /api/v1/leaves/apply', () => {
    const payload = {
      leaveTypeId: 1,
      startDate: '2026-11-01',
      endDate: '2026-11-02',
      reason: 'Personal',
    };

    service.applyLeave(payload).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/apply');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ success: true, data: { leaveRequestId: 101 } });
  });

  it('should call PUT /api/v1/leaves/:id/cancel', () => {
    service.cancelLeave(101).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/101/cancel');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { leaveRequestId: 101, status: 'CANCELLED' } });
  });

  it('should call PUT /api/v1/leaves/:id/approve', () => {
    service.approveLeave(101, { comment: 'Approved' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/101/approve');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { leaveRequestId: 101, status: 'APPROVED' } });
  });

  it('should call PUT /api/v1/leaves/:id/reject', () => {
    service.rejectLeave(101, { comment: 'Rejected' }).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/101/reject');
    expect(req.request.method).toBe('PUT');
    req.flush({ success: true, data: { leaveRequestId: 101, status: 'REJECTED' } });
  });

  it('should call GET /api/v1/leaves/history with all query parameters', () => {
    service
      .getLeaveHistory({
        employeeId: 4,
        status: 'PENDING',
        year: 2026,
        page: 0,
        size: 10,
      })
      .subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:8080/api/v1/leaves/history');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('employeeId')).toBe('4');
    expect(req.request.params.get('status')).toBe('PENDING');
    expect(req.request.params.get('year')).toBe('2026');
    expect(req.request.params.get('page')).toBe('0');
    expect(req.request.params.get('size')).toBe('10');
    req.flush({ success: true, data: { content: [], totalElements: 0 } });
  });

  it('should call GET /api/v1/leaves/pending', () => {
    service.getPendingApprovals().subscribe();

    const req = httpMock.expectOne('http://localhost:8080/api/v1/leaves/pending');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });

  it('should call GET /api/v1/leaves/calendar with date filters and departmentId', () => {
    service.getTeamLeaveCalendar('2026-11-01', '2026-11-30', 1).subscribe();

    const req = httpMock.expectOne(
      'http://localhost:8080/api/v1/leaves/calendar?startDate=2026-11-01&endDate=2026-11-30&departmentId=1'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
