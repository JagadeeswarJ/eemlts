import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { Employee } from '../../../core/models/employee.models';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import {
  selectEmployeeError,
  selectEmployeeLoading,
  selectSelectedEmployee,
} from '../../../store/employee/employee.selectors';
import { EmployeeDetailComponent } from './employee-detail.component';

describe('EmployeeDetailComponent', () => {
  let component: EmployeeDetailComponent;
  let fixture: ComponentFixture<EmployeeDetailComponent>;
  let store: MockStore;

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
      imports: [EmployeeDetailComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '4' } },
          },
        },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
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

    store.overrideSelector(selectSelectedEmployee, mockEmployee);
    store.overrideSelector(selectEmployeeLoading, false);
    store.overrideSelector(selectEmployeeError, null);

    fixture = TestBed.createComponent(EmployeeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render employee full profile data', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('EMP004');
    expect(compiled.textContent).toContain('Engineering');
    expect(compiled.textContent).toContain('Senior Engineer');
    expect(compiled.textContent).toContain('David Miller');
  });

  it('should show Edit Profile action button for ADMIN role', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Edit Profile');
  });
});
