import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { AlertComponent } from '../../../shared/components/alert/alert.component';
import { ValidationMessageComponent } from '../../../shared/components/validation-message/validation-message.component';
import { login } from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';

interface SignInForm {
  email: FormControl<string>;
  password: FormControl<string>;
}

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, AlertComponent, ValidationMessageComponent],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css'],
})
export class SignInComponent {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);

  loading$ = this.store.select(selectAuthLoading);
  error$ = this.store.select(selectAuthError);

  showPassword = signal(false);
  demoAccountsOpen = signal(true);
  submitted = signal(false);

  form: FormGroup<SignInForm> = this.fb.group({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(6)],
    }),
  });

  fillDemoAndSubmit(email: string): void {
    this.form.patchValue({
      email,
      password: 'Password123!',
    });
    this.onSubmit();
  }

  onSubmit(): void {
    this.submitted.set(true);

    const rawEmail = this.form.controls.email.value;
    if (typeof rawEmail === 'string' && rawEmail.trim() !== rawEmail) {
      this.form.controls.email.setValue(rawEmail.trim());
    }

    if (this.form.valid) {
      const { email, password } = this.form.getRawValue();
      this.store.dispatch(login({ request: { email: email.trim(), password } }));
    }
  }
}
