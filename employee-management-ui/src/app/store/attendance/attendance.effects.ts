import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { AttendanceService } from '../../core/services/attendance.service';
import * as AttendanceActions from './attendance.actions';

@Injectable()
export class AttendanceEffects {
  private readonly actions$ = inject(Actions);
  private readonly attendanceService = inject(AttendanceService);

  checkIn$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.checkIn),
      mergeMap(() =>
        this.attendanceService.checkIn().pipe(
          map((res) => AttendanceActions.checkInSuccess({ record: res.data })),
          catchError((err) => of(AttendanceActions.checkInFailure({ error: err.error?.message || 'Check-in failed' })))
        )
      )
    )
  );

  checkOut$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.checkOut),
      mergeMap(() =>
        this.attendanceService.checkOut().pipe(
          map((res) => AttendanceActions.checkOutSuccess({ record: res.data })),
          catchError((err) => of(AttendanceActions.checkOutFailure({ error: err.error?.message || 'Check-out failed' })))
        )
      )
    )
  );

  loadTodayAttendance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.loadTodayAttendance),
      mergeMap(({ employeeId }) =>
        this.attendanceService.getTodayAttendance(employeeId).pipe(
          map((res) => AttendanceActions.loadTodayAttendanceSuccess({ record: res.data })),
          catchError((err) => of(AttendanceActions.loadTodayAttendanceFailure({ error: err.message })))
        )
      )
    )
  );

  loadAttendanceHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.loadAttendanceHistory),
      mergeMap(({ params }) =>
        this.attendanceService.getAttendanceHistory(params).pipe(
          map((res) => AttendanceActions.loadAttendanceHistorySuccess({ response: res.data })),
          catchError((err) => of(AttendanceActions.loadAttendanceHistoryFailure({ error: err.message })))
        )
      )
    )
  );

  loadAttendanceStats$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.loadAttendanceStats),
      mergeMap(({ employeeId, year, month }) =>
        this.attendanceService.getAttendanceStats(employeeId, year, month).pipe(
          map((res) => AttendanceActions.loadAttendanceStatsSuccess({ stats: res.data })),
          catchError((err) => of(AttendanceActions.loadAttendanceStatsFailure({ error: err.message })))
        )
      )
    )
  );

  loadDailyAttendance$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.loadDailyAttendance),
      mergeMap(({ date, departmentId }) =>
        this.attendanceService.getDailyAttendance(date, departmentId).pipe(
          map((res) => AttendanceActions.loadDailyAttendanceSuccess({ summary: res.data })),
          catchError((err) => of(AttendanceActions.loadDailyAttendanceFailure({ error: err.message })))
        )
      )
    )
  );

  requestCorrection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.requestCorrection),
      mergeMap(({ request }) =>
        this.attendanceService.requestCorrection(request).pipe(
          map((res) => AttendanceActions.requestCorrectionSuccess({ log: res.data })),
          catchError((err) => of(AttendanceActions.requestCorrectionFailure({ error: err.error?.message || 'Failed to request correction' })))
        )
      )
    )
  );

  processCorrection$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.processCorrection),
      mergeMap(({ auditId, decision }) =>
        this.attendanceService.processCorrection(auditId, decision).pipe(
          map((res) => AttendanceActions.processCorrectionSuccess({ log: res.data })),
          catchError((err) => of(AttendanceActions.processCorrectionFailure({ error: err.error?.message || 'Failed to process correction' })))
        )
      )
    )
  );

  loadAuditLogs$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AttendanceActions.loadAuditLogs),
      mergeMap(({ employeeId }) =>
        this.attendanceService.getAuditLogs(employeeId).pipe(
          map((res) => AttendanceActions.loadAuditLogsSuccess({ logs: res.data })),
          catchError((err) => of(AttendanceActions.loadAuditLogsFailure({ error: err.message })))
        )
      )
    )
  );
}
