import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { ReportingService } from '../../core/services/reporting.service';
import * as ReportActions from './report.actions';

@Injectable()
export class ReportEffects {
  private readonly actions$ = inject(Actions);
  private readonly reportingService = inject(ReportingService);

  loadEmployeeDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadEmployeeDashboard),
      mergeMap(() =>
        this.reportingService.getEmployeeDashboard().pipe(
          map((res) => ReportActions.loadEmployeeDashboardSuccess({ dashboard: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadEmployeeDashboardFailure({
                error: err.error?.message || err.message || 'Failed to load employee dashboard',
              })
            )
          )
        )
      )
    )
  );

  loadManagerDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadManagerDashboard),
      mergeMap(() =>
        this.reportingService.getManagerDashboard().pipe(
          map((res) => ReportActions.loadManagerDashboardSuccess({ dashboard: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadManagerDashboardFailure({
                error: err.error?.message || err.message || 'Failed to load manager dashboard',
              })
            )
          )
        )
      )
    )
  );

  loadHrDashboard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadHrDashboard),
      mergeMap(() =>
        this.reportingService.getHrDashboard().pipe(
          map((res) => ReportActions.loadHrDashboardSuccess({ dashboard: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadHrDashboardFailure({
                error: err.error?.message || err.message || 'Failed to load HR dashboard',
              })
            )
          )
        )
      )
    )
  );

  loadDepartmentReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadDepartmentReports),
      mergeMap(() =>
        this.reportingService.getDepartmentReports().pipe(
          map((res) => ReportActions.loadDepartmentReportsSuccess({ reports: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadDepartmentReportsFailure({
                error: err.error?.message || err.message || 'Failed to load department reports',
              })
            )
          )
        )
      )
    )
  );

  loadAttendanceReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadAttendanceReports),
      mergeMap(({ year }) =>
        this.reportingService.getAttendanceReports(year).pipe(
          map((res) => ReportActions.loadAttendanceReportsSuccess({ reports: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadAttendanceReportsFailure({
                error: err.error?.message || err.message || 'Failed to load attendance reports',
              })
            )
          )
        )
      )
    )
  );

  loadLeaveReports$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReportActions.loadLeaveReports),
      mergeMap(({ year }) =>
        this.reportingService.getLeaveReports(year).pipe(
          map((res) => ReportActions.loadLeaveReportsSuccess({ reports: res.data })),
          catchError((err) =>
            of(
              ReportActions.loadLeaveReportsFailure({
                error: err.error?.message || err.message || 'Failed to load leave reports',
              })
            )
          )
        )
      )
    )
  );
}
