import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ValidationMessageComponent } from '../../../shared/components/validation-message/validation-message.component';

interface ForgotPasswordForm {
  email: FormControl<string>;
}

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent, ValidationMessageComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css'],
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  loading = signal(false);
  submitted = signal(false);
  alertMessage = signal<string | null>(null);
  alertType = signal<'success' | 'error'>('success');

  form: FormGroup<ForgotPasswordForm> = this.fb.group({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });

  onSubmit(): void {
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const email = this.form.controls.email.value.trim();

    this.authService.forgotPassword(email).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.alertType.set('success');
        this.alertMessage.set(
          res.data ||
            'If the email address exists in our system, password reset instructions have been forwarded to the registered email.'
        );
        this.form.reset();
        this.submitted.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.alertType.set('error');
        this.alertMessage.set(err.error?.message || 'Unable to submit request. Please try again later.');
      },
    });
  }
}
