import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../../core/services/notification.service';
import { loadDepartments } from '../../../store/departments/department.actions';
import {
  selectAllDepartments,
  selectDepartmentsError,
  selectDepartmentsLoading,
} from '../../../store/departments/department.selectors';
import { createEmployee } from '../../../store/employee/employee.actions';
import {
  selectEmployeeActionSuccess,
  selectEmployeeError,
  selectEmployeeLoading,
  selectManagers,
  selectSelectedEmployee,
} from '../../../store/employee/employee.selectors';
import { EmployeeFormComponent } from './employee-form.component';

describe('EmployeeFormComponent', () => {
  let component: EmployeeFormComponent;
  let fixture: ComponentFixture<EmployeeFormComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeFormComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => null } },
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectAllDepartments, [
      {
        departmentId: 1,
        name: 'Engineering',
        code: 'ENG',
        description: 'Software',
        managerId: 3,
        managerName: 'David Miller',
        employeeCount: 4,
      },
    ]);
    store.overrideSelector(selectDepartmentsLoading, false);
    store.overrideSelector(selectDepartmentsError, null);
    store.overrideSelector(selectManagers, [
      {
        employeeId: 3,
        employeeCode: 'EMP003',
        fullName: 'David Miller',
        email: 'manager@company.com',
        designation: 'Manager',
        departmentName: 'Engineering',
      },
    ]);
    store.overrideSelector(selectEmployeeLoading, false);
    store.overrideSelector(selectEmployeeError, null);
    store.overrideSelector(selectSelectedEmployee, null);
    store.overrideSelector(selectEmployeeActionSuccess, false);

    fixture = TestBed.createComponent(EmployeeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and initialize form as invalid', () => {
    expect(component).toBeTruthy();
    expect(component.form.valid).toBe(false);
  });

  it('should prevent submission and mark controls touched when form is invalid', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.onSubmit();

    expect(dispatchSpy).not.toHaveBeenCalledWith(expect.objectContaining({ type: '[Employee] Create Employee' }));
    expect(component.submitted).toBe(true);
    expect(component.form.controls.firstName.touched).toBe(true);
    expect(component.form.controls.email.touched).toBe(true);
  });

  it('should render department options from store', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('#departmentId') as HTMLSelectElement;
    expect(select).not.toBeNull();
    expect(select.options.length).toBe(2); // placeholder + 1 dept
    expect(select.options[1].textContent).toContain('Engineering (ENG)');
  });

  it('should disable only department control when deptLoading is true', () => {
    store.overrideSelector(selectDepartmentsLoading, true);
    store.refreshState();
    fixture.detectChanges();

    expect(component.form.controls.departmentId.disabled).toBe(true);
    expect(component.form.controls.firstName.disabled).toBe(false);
  });

  it('should dispatch loadDepartments on retry button click when department error exists', () => {
    store.overrideSelector(selectDepartmentsError, 'Gateway timeout');
    store.refreshState();
    fixture.detectChanges();

    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.retryLoadDepartments();

    expect(dispatchSpy).toHaveBeenCalledWith(loadDepartments());
  });

  it('should dispatch createEmployee when form is valid', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.form.patchValue({
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice.smith@company.com',
      phone: '+1-555-0105',
      departmentId: '1',
      designation: 'Cloud Engineer',
      joiningDate: '2026-10-22',
      address: '100 Loop St',
      emergencyContact: 'Bob Smith - +1-555-0106',
      role: 'EMPLOYEE',
    });

    component.onSubmit();
    expect(dispatchSpy).toHaveBeenCalledWith(
      createEmployee({
        request: {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice.smith@company.com',
          phone: '+1-555-0105',
          departmentId: 1,
          designation: 'Cloud Engineer',
          joiningDate: '2026-10-22',
          managerId: null,
          address: '100 Loop St',
          emergencyContact: 'Bob Smith - +1-555-0106',
          role: 'EMPLOYEE' as any,
        },
      })
    );
  });
});
