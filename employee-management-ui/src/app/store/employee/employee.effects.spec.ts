import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EmployeeService } from '../../core/services/employee.service';
import * as EmployeeActions from './employee.actions';
import { EmployeeEffects } from './employee.effects';

describe('EmployeeEffects', () => {
  let actions$: Observable<any>;
  let effects: EmployeeEffects;
  let employeeServiceMock: {
    getEmployees: any;
    getEmployeeById: any;
    createEmployee: any;
    updateEmployee: any;
    deactivateEmployee: any;
    getManagers: any;
  };

  beforeEach(() => {
    employeeServiceMock = {
      getEmployees: vi.fn(),
      getEmployeeById: vi.fn(),
      createEmployee: vi.fn(),
      updateEmployee: vi.fn(),
      deactivateEmployee: vi.fn(),
      getManagers: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        EmployeeEffects,
        provideMockActions(() => actions$),
        { provide: EmployeeService, useValue: employeeServiceMock },
      ],
    });

    effects = TestBed.inject(EmployeeEffects);
  });

  it('should dispatch loadEmployeesSuccess on successful fetch', () => {
    const mockPaged = {
      content: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      isFirst: true,
      isLast: true,
    };

    employeeServiceMock.getEmployees.mockReturnValue(of({ success: true, data: mockPaged }));
    actions$ = of(EmployeeActions.loadEmployees({ params: {} }));

    effects.loadEmployees$.subscribe((action) => {
      expect(action).toEqual(EmployeeActions.loadEmployeesSuccess({ response: mockPaged }));
    });
  });

  it('should dispatch createEmployeeSuccess on createEmployee', () => {
    const mockEmp = { employeeId: 5, firstName: 'Sarah' };
    employeeServiceMock.createEmployee.mockReturnValue(of({ success: true, data: mockEmp }));
    actions$ = of(EmployeeActions.createEmployee({ request: {} as any }));

    effects.createEmployee$.subscribe((action) => {
      expect(action).toEqual(EmployeeActions.createEmployeeSuccess({ employee: mockEmp as any }));
    });
  });

  it('should dispatch updateEmployeeSuccess on updateEmployee', () => {
    const mockEmp = { employeeId: 5, firstName: 'Sarah' };
    employeeServiceMock.updateEmployee.mockReturnValue(of({ success: true, data: mockEmp }));
    actions$ = of(EmployeeActions.updateEmployee({ id: 5, request: {} as any }));

    effects.updateEmployee$.subscribe((action) => {
      expect(action).toEqual(EmployeeActions.updateEmployeeSuccess({ employee: mockEmp as any }));
    });
  });

  it('should dispatch deactivateEmployeeSuccess on deactivateEmployee', () => {
    employeeServiceMock.deactivateEmployee.mockReturnValue(of({ success: true, data: 'OK' }));
    actions$ = of(EmployeeActions.deactivateEmployee({ id: 5 }));

    effects.deactivateEmployee$.subscribe((action) => {
      expect(action).toEqual(EmployeeActions.deactivateEmployeeSuccess({ id: 5 }));
    });
  });
});
