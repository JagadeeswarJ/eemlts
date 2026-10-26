import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { beforeEach, describe, expect, it } from 'vitest';
import { ValidationMessageComponent } from './validation-message.component';

describe('ValidationMessageComponent', () => {
  let component: ValidationMessageComponent;
  let fixture: ComponentFixture<ValidationMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidationMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidationMessageComponent);
    component = fixture.componentInstance;
  });

  it('should not render anything when control is valid', () => {
    component.control = new FormControl('Valid text', Validators.required);
    component.control.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('');
  });

  it('should not render anything when control is invalid but untouched and not submitted', () => {
    component.control = new FormControl('', Validators.required);
    component.submitted = false;
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('');
  });

  it('should render required message when touched and empty', () => {
    component.control = new FormControl('', Validators.required);
    component.control.markAsTouched();
    component.fieldName = 'Work Email';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Work Email is required.');
  });

  it('should render email format error message', () => {
    component.control = new FormControl('invalid-email', [Validators.required, Validators.email]);
    component.control.markAsTouched();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Please enter a valid work email address.');
  });

  it('should render minlength error message', () => {
    component.control = new FormControl('abc', [Validators.minLength(8)]);
    component.control.markAsTouched();
    component.fieldName = 'Password';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Password must be at least 8 characters.');
  });
});
