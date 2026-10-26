import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-validation-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.css'],
})
export class ValidationMessageComponent {
  @Input() control: AbstractControl | null = null;
  @Input() fieldName = 'This field';
  @Input() submitted = false;
  @Input() customMessages?: Record<string, string>;

  get shouldShow(): boolean {
    if (!this.control) return false;
    return this.control.invalid && (this.control.touched || this.control.dirty || this.submitted);
  }

  get errorMessage(): string | null {
    if (!this.control || !this.control.errors) return null;

    const errors = this.control.errors;

    if (this.customMessages) {
      for (const key of Object.keys(errors)) {
        if (this.customMessages[key]) {
          return this.customMessages[key];
        }
      }
    }

    if (errors['required']) {
      return `${this.fieldName} is required.`;
    }

    if (errors['email']) {
      return 'Please enter a valid work email address.';
    }

    if (errors['minlength']) {
      return `${this.fieldName} must be at least ${errors['minlength'].requiredLength} characters.`;
    }

    if (errors['maxlength']) {
      return `${this.fieldName} cannot exceed ${errors['maxlength'].requiredLength} characters.`;
    }

    if (errors['pattern']) {
      return `${this.fieldName} format is invalid.`;
    }

    if (errors['dateOrder']) {
      return 'End date cannot be earlier than start date.';
    }

    if (errors['timeOrder']) {
      return 'Check-out time must be later than check-in time.';
    }

    if (errors['passwordMismatch']) {
      return 'Passwords do not match.';
    }

    if (errors['serverError']) {
      return typeof errors['serverError'] === 'string'
        ? errors['serverError']
        : 'Invalid field value.';
    }

    return `${this.fieldName} is invalid.`;
  }
}
