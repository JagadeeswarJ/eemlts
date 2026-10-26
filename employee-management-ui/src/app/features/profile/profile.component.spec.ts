import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { selectCurrentUser } from '../../store/auth/auth.selectors';
import { ProfileComponent } from './profile.component';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let store: MockStore;
  let authServiceMock: { changePassword: any };
  let employeeServiceMock: { getEmployeeById: any; updateSelfProfile: any };
  let notificationService: NotificationService;

  const mockUser = {
    userId: 1,
    employeeId: 4,
    employeeCode: 'EMP004',
    email: 'alex.jones@company.com',
    role: 'EMPLOYEE' as const,
    firstName: 'Alex',
    lastName: 'Jones',
    fullName: 'Alex Jones',
    departmentId: 1,
    departmentName: 'Engineering',
    designation: 'Senior Engineer',
  };

  const mockEmployeeData = {
    employeeId: 4,
    phone: '+1-555-0104',
    address: '100 Main St',
    emergencyContact: 'Family Contact',
  };

  beforeEach(async () => {
    authServiceMock = {
      changePassword: vi.fn(),
    };

    employeeServiceMock = {
      getEmployeeById: vi.fn().mockReturnValue(of({ success: true, data: mockEmployeeData })),
      updateSelfProfile: vi.fn().mockReturnValue(of({ success: true, data: mockEmployeeData })),
    };

    await TestBed.configureTestingModule({
      imports: [ProfileComponent, ReactiveFormsModule],
      providers: [
        provideMockStore(),
        NotificationService,
        { provide: AuthService, useValue: authServiceMock },
        { provide: EmployeeService, useValue: employeeServiceMock },
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    notificationService = TestBed.inject(NotificationService);
    store.overrideSelector(selectCurrentUser, mockUser);

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render user profile information and populate contact form', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('Engineering');
    expect(compiled.textContent).toContain('EMP004');
    expect(compiled.textContent).toContain('alex.jones@company.com');
  });

  it('should submit updated contact information without modifying protected fields', () => {
    component.contactForm.patchValue({
      phone: '+1-555-7777',
      address: '456 Oak Ave',
      emergencyContact: 'Sister - +1-555-1111',
    });

    component.onSaveContactInfo();

    expect(employeeServiceMock.updateSelfProfile).toHaveBeenCalledWith({
      phone: '+1-555-7777',
      address: '456 Oak Ave',
      emergencyContact: 'Sister - +1-555-1111',
    });
  });

  it('should show error when new and confirm passwords do not match', () => {
    component.passwordForm.patchValue({
      currentPassword: 'Password123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'MismatchPassword123!',
    });

    component.onChangePassword();
    expect(component.alertMessage).toContain('do not match');
    expect(component.alertType).toBe('error');
    expect(authServiceMock.changePassword).not.toHaveBeenCalled();
  });

  it('should call changePassword when form is valid and matching', () => {
    authServiceMock.changePassword.mockReturnValue(of({ success: true, data: 'OK' }));

    component.passwordForm.patchValue({
      currentPassword: 'Password123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    });

    component.onChangePassword();
    expect(authServiceMock.changePassword).toHaveBeenCalled();
    expect(component.alertType).toBe('success');
  });
});
