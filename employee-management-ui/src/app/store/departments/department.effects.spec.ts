import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Department } from '../../core/models/employee.models';
import { DepartmentService } from '../../core/services/department.service';
import * as DepartmentActions from './department.actions';
import { DepartmentEffects } from './department.effects';

describe('DepartmentEffects', () => {
  let actions$: Observable<any>;
  let effects: DepartmentEffects;
  let departmentServiceMock: { getDepartments: any };

  beforeEach(() => {
    departmentServiceMock = {
      getDepartments: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        DepartmentEffects,
        provideMockActions(() => actions$),
        { provide: DepartmentService, useValue: departmentServiceMock },
      ],
    });

    effects = TestBed.inject(DepartmentEffects);
  });

  it('should dispatch loadDepartmentsSuccess on successful API call', () => {
    const departments: Department[] = [
      {
        departmentId: 1,
        name: 'Engineering',
        code: 'ENG',
        description: 'Tech',
        managerId: 3,
        managerName: 'David Miller',
        employeeCount: 4,
      },
    ];

    departmentServiceMock.getDepartments.mockReturnValue(
      of({ success: true, data: departments })
    );

    actions$ = of(DepartmentActions.loadDepartments());

    effects.loadDepartments$.subscribe((action) => {
      expect(action).toEqual(DepartmentActions.loadDepartmentsSuccess({ departments }));
    });
  });

  it('should dispatch loadDepartmentsFailure on API error', () => {
    departmentServiceMock.getDepartments.mockReturnValue(
      throwError(() => new Error('Service unavailable'))
    );

    actions$ = of(DepartmentActions.loadDepartments());

    effects.loadDepartments$.subscribe((action) => {
      expect(action.type).toBe(DepartmentActions.loadDepartmentsFailure.type);
    });
  });
});
