import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttendanceService } from '../../core/services/attendance.service';
import * as AttendanceActions from './attendance.actions';
import { AttendanceEffects } from './attendance.effects';

describe('AttendanceEffects', () => {
  let actions$: Observable<any>;
  let effects: AttendanceEffects;
  let attendanceServiceMock: {
    checkIn: any;
    checkOut: any;
    getTodayAttendance: any;
    getAttendanceHistory: any;
    getAttendanceStats: any;
    requestCorrection: any;
    processCorrection: any;
  };

  beforeEach(() => {
    attendanceServiceMock = {
      checkIn: vi.fn(),
      checkOut: vi.fn(),
      getTodayAttendance: vi.fn(),
      getAttendanceHistory: vi.fn(),
      getAttendanceStats: vi.fn(),
      requestCorrection: vi.fn(),
      processCorrection: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        AttendanceEffects,
        provideMockActions(() => actions$),
        { provide: AttendanceService, useValue: attendanceServiceMock },
      ],
    });

    effects = TestBed.inject(AttendanceEffects);
  });

  it('should dispatch checkInSuccess on checkIn', () => {
    const mockRecord = { attendanceId: 101, status: 'PRESENT' as const };
    attendanceServiceMock.checkIn.mockReturnValue(of({ success: true, data: mockRecord }));
    actions$ = of(AttendanceActions.checkIn());

    effects.checkIn$.subscribe((action) => {
      expect(action).toEqual(AttendanceActions.checkInSuccess({ record: mockRecord as any }));
    });
  });

  it('should dispatch checkOutSuccess on checkOut', () => {
    const mockRecord = { attendanceId: 101, status: 'PRESENT' as const, totalHours: 8.0 };
    attendanceServiceMock.checkOut.mockReturnValue(of({ success: true, data: mockRecord }));
    actions$ = of(AttendanceActions.checkOut());

    effects.checkOut$.subscribe((action) => {
      expect(action).toEqual(AttendanceActions.checkOutSuccess({ record: mockRecord as any }));
    });
  });

  it('should dispatch loadTodayAttendanceSuccess on loadTodayAttendance', () => {
    const mockRecord = { attendanceId: 101, status: 'PRESENT' as const };
    attendanceServiceMock.getTodayAttendance.mockReturnValue(of({ success: true, data: mockRecord }));
    actions$ = of(AttendanceActions.loadTodayAttendance({ employeeId: 4 }));

    effects.loadTodayAttendance$.subscribe((action) => {
      expect(action).toEqual(AttendanceActions.loadTodayAttendanceSuccess({ record: mockRecord as any }));
    });
  });

  it('should dispatch loadAttendanceHistorySuccess on loadAttendanceHistory', () => {
    const mockPaged = { content: [], totalElements: 0, totalPages: 0, page: 0, size: 10, isFirst: true, isLast: true };
    attendanceServiceMock.getAttendanceHistory.mockReturnValue(of({ success: true, data: mockPaged }));
    actions$ = of(AttendanceActions.loadAttendanceHistory({ params: {} }));

    effects.loadAttendanceHistory$.subscribe((action) => {
      expect(action).toEqual(AttendanceActions.loadAttendanceHistorySuccess({ response: mockPaged }));
    });
  });
});
