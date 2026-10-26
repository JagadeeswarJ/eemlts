import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ReportingService } from '../../core/services/reporting.service';
import * as ReportActions from './report.actions';
import { ReportEffects } from './report.effects';

describe('ReportEffects', () => {
  let actions$: Observable<any>;
  let effects: ReportEffects;
  let reportingServiceMock: {
    getEmployeeDashboard: any;
    getManagerDashboard: any;
    getHrDashboard: any;
    getDepartmentReports: any;
    getAttendanceReports: any;
    getLeaveReports: any;
  };

  beforeEach(() => {
    reportingServiceMock = {
      getEmployeeDashboard: vi.fn(),
      getManagerDashboard: vi.fn(),
      getHrDashboard: vi.fn(),
      getDepartmentReports: vi.fn(),
      getAttendanceReports: vi.fn(),
      getLeaveReports: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        ReportEffects,
        provideMockActions(() => actions$),
        { provide: ReportingService, useValue: reportingServiceMock },
      ],
    });

    effects = TestBed.inject(ReportEffects);
  });

  it('should dispatch loadEmployeeDashboardSuccess on fetch', () => {
    reportingServiceMock.getEmployeeDashboard.mockReturnValue(of({ success: true, data: {} }));
    actions$ = of(ReportActions.loadEmployeeDashboard());

    effects.loadEmployeeDashboard$.subscribe((action) => {
      expect(action).toEqual(ReportActions.loadEmployeeDashboardSuccess({ dashboard: {} as any }));
    });
  });

  it('should dispatch loadManagerDashboardSuccess on fetch', () => {
    reportingServiceMock.getManagerDashboard.mockReturnValue(of({ success: true, data: {} }));
    actions$ = of(ReportActions.loadManagerDashboard());

    effects.loadManagerDashboard$.subscribe((action) => {
      expect(action).toEqual(ReportActions.loadManagerDashboardSuccess({ dashboard: {} as any }));
    });
  });

  it('should dispatch loadHrDashboardSuccess on fetch', () => {
    reportingServiceMock.getHrDashboard.mockReturnValue(of({ success: true, data: {} }));
    actions$ = of(ReportActions.loadHrDashboard());

    effects.loadHrDashboard$.subscribe((action) => {
      expect(action).toEqual(ReportActions.loadHrDashboardSuccess({ dashboard: {} as any }));
    });
  });

  it('should dispatch loadDepartmentReportsSuccess on fetch', () => {
    reportingServiceMock.getDepartmentReports.mockReturnValue(of({ success: true, data: [] }));
    actions$ = of(ReportActions.loadDepartmentReports());

    effects.loadDepartmentReports$.subscribe((action) => {
      expect(action).toEqual(ReportActions.loadDepartmentReportsSuccess({ reports: [] }));
    });
  });
});
