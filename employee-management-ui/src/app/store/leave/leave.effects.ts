import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { LeaveService } from '../../core/services/leave.service';
import * as LeaveActions from './leave.actions';

@Injectable()
export class LeaveEffects {
  private readonly actions$ = inject(Actions);
  private readonly leaveService = inject(LeaveService);

  loadLeaveTypes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.loadLeaveTypes),
      mergeMap(() =>
        this.leaveService.getLeaveTypes().pipe(
          map((res) => LeaveActions.loadLeaveTypesSuccess({ types: res.data })),
          catchError((err) => of(LeaveActions.loadLeaveTypesFailure({ error: err.message })))
        )
      )
    )
  );

  loadLeaveBalances$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.loadLeaveBalances),
      mergeMap(({ employeeId, year }) =>
        this.leaveService.getLeaveBalances(employeeId, year).pipe(
          map((res) => LeaveActions.loadLeaveBalancesSuccess({ balances: res.data })),
          catchError((err) => of(LeaveActions.loadLeaveBalancesFailure({ error: err.message })))
        )
      )
    )
  );

  applyLeave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.applyLeave),
      mergeMap(({ request }) =>
        this.leaveService.applyLeave(request).pipe(
          map((res) => LeaveActions.applyLeaveSuccess({ request: res.data })),
          catchError((err) => of(LeaveActions.applyLeaveFailure({ error: err.error?.message || 'Failed to apply for leave' })))
        )
      )
    )
  );

  cancelLeave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.cancelLeave),
      mergeMap(({ leaveRequestId }) =>
        this.leaveService.cancelLeave(leaveRequestId).pipe(
          map((res) => LeaveActions.cancelLeaveSuccess({ request: res.data })),
          catchError((err) => of(LeaveActions.cancelLeaveFailure({ error: err.error?.message || 'Failed to cancel leave' })))
        )
      )
    )
  );

  approveLeave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.approveLeave),
      mergeMap(({ leaveRequestId, decision }) =>
        this.leaveService.approveLeave(leaveRequestId, decision).pipe(
          map((res) => LeaveActions.approveLeaveSuccess({ request: res.data })),
          catchError((err) => of(LeaveActions.approveLeaveFailure({ error: err.error?.message || 'Failed to approve leave' })))
        )
      )
    )
  );

  rejectLeave$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.rejectLeave),
      mergeMap(({ leaveRequestId, decision }) =>
        this.leaveService.rejectLeave(leaveRequestId, decision).pipe(
          map((res) => LeaveActions.rejectLeaveSuccess({ request: res.data })),
          catchError((err) => of(LeaveActions.rejectLeaveFailure({ error: err.error?.message || 'Failed to reject leave' })))
        )
      )
    )
  );

  loadLeaveHistory$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.loadLeaveHistory),
      mergeMap(({ params }) =>
        this.leaveService.getLeaveHistory(params).pipe(
          map((res) => LeaveActions.loadLeaveHistorySuccess({ response: res.data })),
          catchError((err) => of(LeaveActions.loadLeaveHistoryFailure({ error: err.message })))
        )
      )
    )
  );

  loadPendingApprovals$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.loadPendingApprovals),
      mergeMap(() =>
        this.leaveService.getPendingApprovals().pipe(
          map((res) => LeaveActions.loadPendingApprovalsSuccess({ requests: res.data })),
          catchError((err) => of(LeaveActions.loadPendingApprovalsFailure({ error: err.message })))
        )
      )
    )
  );

  loadTeamCalendar$ = createEffect(() =>
    this.actions$.pipe(
      ofType(LeaveActions.loadTeamCalendar),
      mergeMap(({ startDate, endDate, departmentId }) =>
        this.leaveService.getTeamLeaveCalendar(startDate, endDate, departmentId).pipe(
          map((res) => LeaveActions.loadTeamCalendarSuccess({ items: res.data })),
          catchError((err) => of(LeaveActions.loadTeamCalendarFailure({ error: err.message })))
        )
      )
    )
  );
}
