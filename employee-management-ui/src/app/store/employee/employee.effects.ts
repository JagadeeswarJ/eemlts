import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { EmployeeService } from '../../core/services/employee.service';
import * as EmployeeActions from './employee.actions';

@Injectable()
export class EmployeeEffects {
  private readonly actions$ = inject(Actions);
  private readonly employeeService = inject(EmployeeService);

  loadEmployees$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployees),
      mergeMap(({ params }) =>
        this.employeeService.getEmployees(params).pipe(
          map((res) => EmployeeActions.loadEmployeesSuccess({ response: res.data })),
          catchError((err) => of(EmployeeActions.loadEmployeesFailure({ error: err.error?.message || 'Failed to load employees' })))
        )
      )
    )
  );

  loadEmployeeById$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadEmployeeById),
      mergeMap(({ id }) =>
        this.employeeService.getEmployeeById(id).pipe(
          map((res) => EmployeeActions.loadEmployeeByIdSuccess({ employee: res.data })),
          catchError((err) => of(EmployeeActions.loadEmployeeByIdFailure({ error: err.error?.message || 'Failed to load employee details' })))
        )
      )
    )
  );

  createEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.createEmployee),
      mergeMap(({ request }) =>
        this.employeeService.createEmployee(request).pipe(
          map((res) => EmployeeActions.createEmployeeSuccess({ employee: res.data })),
          catchError((err) => of(EmployeeActions.createEmployeeFailure({ error: err.error?.message || 'Failed to create employee' })))
        )
      )
    )
  );

  updateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.updateEmployee),
      mergeMap(({ id, request }) =>
        this.employeeService.updateEmployee(id, request).pipe(
          map((res) => EmployeeActions.updateEmployeeSuccess({ employee: res.data })),
          catchError((err) => of(EmployeeActions.updateEmployeeFailure({ error: err.error?.message || 'Failed to update employee' })))
        )
      )
    )
  );

  deactivateEmployee$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.deactivateEmployee),
      mergeMap(({ id }) =>
        this.employeeService.deactivateEmployee(id).pipe(
          map(() => EmployeeActions.deactivateEmployeeSuccess({ id })),
          catchError((err) => of(EmployeeActions.deactivateEmployeeFailure({ error: err.error?.message || 'Failed to deactivate employee' })))
        )
      )
    )
  );

  loadDepartments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadDepartments),
      mergeMap(() =>
        this.employeeService.getDepartments().pipe(
          map((res) => EmployeeActions.loadDepartmentsSuccess({ departments: res.data })),
          catchError((err) => of(EmployeeActions.loadDepartmentsFailure({ error: err.message })))
        )
      )
    )
  );

  loadManagers$ = createEffect(() =>
    this.actions$.pipe(
      ofType(EmployeeActions.loadManagers),
      mergeMap(() =>
        this.employeeService.getManagers().pipe(
          map((res) => EmployeeActions.loadManagersSuccess({ managers: res.data })),
          catchError((err) => of(EmployeeActions.loadManagersFailure({ error: err.message })))
        )
      )
    )
  );
}
