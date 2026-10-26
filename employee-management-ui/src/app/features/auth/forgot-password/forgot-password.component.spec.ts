import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../../core/services/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let component: ForgotPasswordComponent;
  let fixture: ComponentFixture<ForgotPasswordComponent>;
  let authServiceMock: { forgotPassword: any };

  beforeEach(async () => {
    authServiceMock = {
      forgotPassword: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render branding and form elements', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Reset Password');
    expect(compiled.querySelector('#reset-email')).not.toBeNull();
  });

  it('should validate email format and prevent submission when invalid', () => {
    component.form.controls.email.setValue('not-an-email');
    component.onSubmit();

    expect(authServiceMock.forgotPassword).not.toHaveBeenCalled();
    expect(component.form.invalid).toBe(true);
    expect(component.submitted()).toBe(true);
  });

  it('should submit request to auth service and display success message', () => {
    authServiceMock.forgotPassword.mockReturnValue(of({ success: true, data: 'Email sent' }));

    component.form.controls.email.setValue('valid@company.com');
    component.onSubmit();

    expect(authServiceMock.forgotPassword).toHaveBeenCalledWith('valid@company.com');
    expect(component.alertType()).toBe('success');
    expect(component.alertMessage()).toBe('Email sent');
  });
});
