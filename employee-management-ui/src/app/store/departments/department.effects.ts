import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap, of } from 'rxjs';
import { DepartmentService } from '../../core/services/department.service';
import * as DepartmentActions from './department.actions';

@Injectable()
export class DepartmentEffects {
  private readonly actions$ = inject(Actions);
  private readonly departmentService = inject(DepartmentService);

  loadDepartments$ = createEffect(() =>
    this.actions$.pipe(
      ofType(DepartmentActions.loadDepartments),
      mergeMap(() =>
        this.departmentService.getDepartments().pipe(
          map((res) => DepartmentActions.loadDepartmentsSuccess({ departments: res.data || [] })),
          catchError((err) =>
            of(
              DepartmentActions.loadDepartmentsFailure({
                error: err.error?.message || err.message || 'Failed to load departments',
              })
            )
          )
        )
      )
    )
  );
}
