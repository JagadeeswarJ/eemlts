import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Employee } from '../../../core/models/employee.models';
import { NotificationService } from '../../../core/services/notification.service';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { selectAllDepartments } from '../../../store/departments/department.selectors';
import { deactivateEmployee, loadEmployees } from '../../../store/employee/employee.actions';
import {
  selectAllEmployees,
  selectEmployeeActionSuccess,
  selectEmployeeCurrentPage,
  selectEmployeeError,
  selectEmployeeLoading,
  selectEmployeeTotalElements,
  selectEmployeeTotalPages,
} from '../../../store/employee/employee.selectors';
import { EmployeeListComponent } from './employee-list.component';

describe('EmployeeListComponent', () => {
  let component: EmployeeListComponent;
  let fixture: ComponentFixture<EmployeeListComponent>;
  let store: MockStore;
  let notificationService: NotificationService;

  const mockEmployee: Employee = {
    employeeId: 4,
    userId: 4,
    employeeCode: 'EMP004',
    firstName: 'Alex',
    lastName: 'Jones',
    fullName: 'Alex Jones',
    email: 'alex.jones@company.com',
    phone: '+1-555-0104',
    departmentId: 1,
    departmentName: 'Engineering',
    designation: 'Senior Engineer',
    joiningDate: '2023-02-10',
    employmentStatus: 'ACTIVE',
    managerId: 3,
    managerName: 'David Miller',
    address: 'Market St',
    emergencyContact: 'Family',
    role: 'EMPLOYEE',
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeListComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        NotificationService,
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);

    store.overrideSelector(selectCurrentUser, {
      userId: 1,
      employeeId: 1,
      employeeCode: 'EMP001',
      email: 'admin@company.com',
      role: 'ADMIN',
      firstName: 'John',
      lastName: 'Admin',
      fullName: 'John Admin',
      departmentId: 1,
      departmentName: 'HR',
      designation: 'Administrator',
    });

    store.overrideSelector(selectAllEmployees, [mockEmployee]);
    store.overrideSelector(selectAllDepartments, []);
    store.overrideSelector(selectEmployeeLoading, false);
    store.overrideSelector(selectEmployeeError, null);
    store.overrideSelector(selectEmployeeTotalElements, 1);
    store.overrideSelector(selectEmployeeTotalPages, 1);
    store.overrideSelector(selectEmployeeCurrentPage, 0);
    store.overrideSelector(selectEmployeeActionSuccess, false);

    fixture = TestBed.createComponent(EmployeeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render employee table', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('EMP004');
    expect(compiled.textContent).toContain('Senior Engineer');
  });

  it('should render Add New Employee button for ADMIN role', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Add New Employee');
  });

  it('should dispatch loadEmployees on search input', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.searchQuery = 'Alex';
    component.onSearch();

    expect(dispatchSpy).toHaveBeenCalledWith(
      loadEmployees({ params: { page: 0, size: 10, search: 'Alex' } })
    );
  });

  it('should open confirm dialog on deactivation and dispatch action when confirmed', async () => {
    vi.spyOn(notificationService, 'confirm').mockResolvedValue(true);
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    await component.onDeactivate(mockEmployee);

    expect(dispatchSpy).toHaveBeenCalledWith(
      deactivateEmployee({ id: mockEmployee.employeeId })
    );
  });
});
