import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { AuthService } from '../../core/services/auth.service';
import { EmployeeService } from '../../core/services/employee.service';
import { NotificationService } from '../../core/services/notification.service';
import { AlertComponent } from '../../shared/components/alert/alert.component';
import { loadCurrentUser } from '../../store/auth/auth.actions';
import { selectCurrentUser } from '../../store/auth/auth.selectors';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly authService = inject(AuthService);
  private readonly employeeService = inject(EmployeeService);
  private readonly notificationService = inject(NotificationService);

  currentUser$ = this.store.select(selectCurrentUser);
  alertMessage: string | null = null;
  alertType: 'success' | 'error' = 'success';
  isSubmitting = false;
  isSavingContact = false;

  contactForm = this.fb.group({
    phone: ['', [Validators.required]],
    address: ['', [Validators.required]],
    emergencyContact: ['', [Validators.required]],
  });

  passwordForm = this.fb.group({
    currentPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  ngOnInit(): void {
    this.store.dispatch(loadCurrentUser());

    this.currentUser$.subscribe((user) => {
      if (user && user.employeeId) {
        this.employeeService.getEmployeeById(user.employeeId).subscribe({
          next: (res) => {
            if (res.data) {
              this.contactForm.patchValue({
                phone: res.data.phone || '',
                address: res.data.address || '',
                emergencyContact: res.data.emergencyContact || '',
              });
            }
          },
        });
      }
    });
  }

  onSaveContactInfo(): void {
    if (this.contactForm.valid) {
      this.isSavingContact = true;
      const v = this.contactForm.value;
      this.employeeService
        .updateSelfProfile({
          phone: v.phone!,
          address: v.address!,
          emergencyContact: v.emergencyContact!,
        })
        .subscribe({
          next: () => {
            this.isSavingContact = false;
            this.notificationService.success('Personal contact information updated successfully.');
            this.store.dispatch(loadCurrentUser());
          },
          error: (err) => {
            this.isSavingContact = false;
            this.notificationService.error(err.error?.message || 'Failed to update contact details.');
          },
        });
    }
  }

  onChangePassword(): void {
    if (this.passwordForm.valid) {
      const v = this.passwordForm.value;
      if (v.newPassword !== v.confirmPassword) {
        this.alertMessage = 'New password and confirmation password do not match.';
        this.alertType = 'error';
        return;
      }

      this.isSubmitting = true;
      this.authService
        .changePassword({
          currentPassword: v.currentPassword!,
          newPassword: v.newPassword!,
          confirmPassword: v.confirmPassword!,
        })
        .subscribe({
          next: () => {
            this.isSubmitting = false;
            this.alertMessage = 'Password updated successfully!';
            this.alertType = 'success';
            this.passwordForm.reset();
          },
          error: (err) => {
            this.isSubmitting = false;
            this.alertMessage = err.error?.message || 'Failed to change password.';
            this.alertType = 'error';
          },
        });
    }
  }
}
