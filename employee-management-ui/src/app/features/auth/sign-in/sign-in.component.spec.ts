import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { login } from '../../../store/auth/auth.actions';
import { selectAuthError, selectAuthLoading } from '../../../store/auth/auth.selectors';
import { SignInComponent } from './sign-in.component';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  let store: MockStore;

  const initialState = {
    auth: {
      currentUser: null,
      token: null,
      loading: false,
      error: null,
    },
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        provideRouter([]),
        provideMockStore({ initialState }),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectAuthLoading, false);
    store.overrideSelector(selectAuthError, null);

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render EMS branding and headings', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EMS');
    expect(compiled.textContent).toContain('Welcome back');
    expect(compiled.textContent).toContain('Enterprise HR Portal');
  });

  it('should render email and password inputs with matching label attributes', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const emailInput = compiled.querySelector('#work-email');
    const passwordInput = compiled.querySelector('#work-password');
    const emailLabel = compiled.querySelector('label[for="work-email"]');
    const passwordLabel = compiled.querySelector('label[for="work-password"]');

    expect(emailInput).not.toBeNull();
    expect(passwordInput).not.toBeNull();
    expect(emailLabel).not.toBeNull();
    expect(passwordLabel).not.toBeNull();
  });

  it('should initialize with default demo values and be valid', () => {
    expect(component.form.valid).toBe(true);
    expect(component.form.value.email).toBe('alex.jones@company.com');
  });

  it('should invalidate form when email is empty or invalid', () => {
    component.form.patchValue({ email: '' });
    expect(component.form.get('email')?.hasError('required')).toBe(true);
    expect(component.form.valid).toBe(false);

    component.form.patchValue({ email: 'invalid-email-format' });
    expect(component.form.get('email')?.hasError('email')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should invalidate form when password is empty', () => {
    component.form.patchValue({ password: '' });
    expect(component.form.get('password')?.hasError('required')).toBe(true);
    expect(component.form.valid).toBe(false);
  });

  it('should toggle password visibility and update aria-label', () => {
    expect(component.showPassword()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    let passwordInput = compiled.querySelector('#work-password') as HTMLInputElement;
    expect(passwordInput.type).toBe('password');

    component.showPassword.set(true);
    fixture.detectChanges();

    passwordInput = compiled.querySelector('#work-password') as HTMLInputElement;
    expect(passwordInput.type).toBe('text');

    const toggleBtn = compiled.querySelector('button[aria-label="Hide password"]');
    expect(toggleBtn).not.toBeNull();
  });

  it('should dispatch login action upon valid form submission', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form.patchValue({
      email: 'admin@company.com',
      password: 'Password123!',
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      login({
        request: {
          email: 'admin@company.com',
          password: 'Password123!',
        },
      })
    );
  });

  it('should trim whitespace from email before dispatching login', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form.patchValue({
      email: '   manager@company.com   ',
      password: 'Password123!',
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledWith(
      login({
        request: {
          email: 'manager@company.com',
          password: 'Password123!',
        },
      })
    );
  });

  it('should display loading spinner and set aria-busy when loading$ is true', () => {
    store.overrideSelector(selectAuthLoading, true);
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const submitBtn = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(submitBtn.disabled).toBe(true);
    expect(submitBtn.getAttribute('aria-busy')).toBe('true');
    expect(submitBtn.textContent).toContain('Signing in...');
  });

  it('should render accessible error alert when error$ emits', () => {
    store.overrideSelector(selectAuthError, 'Invalid email or password');
    store.refreshState();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const alertBox = compiled.querySelector('[role="alert"]');

    expect(alertBox).not.toBeNull();
    expect(alertBox?.textContent).toContain('Invalid email or password');
  });

  it('should fill demo credentials and submit on quick demo click', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');

    component.fillDemoAndSubmit('hr@company.com');

    expect(component.form.value.email).toBe('hr@company.com');
    expect(dispatchSpy).toHaveBeenCalledWith(
      login({
        request: {
          email: 'hr@company.com',
          password: 'Password123!',
        },
      })
    );
  });

  it('should only dispatch authentication action and never request dashboard, attendance, or leave data', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form.patchValue({
      email: 'alex.jones@company.com',
      password: 'Password123!',
    });

    component.onSubmit();

    expect(dispatchSpy).toHaveBeenCalledTimes(1);
    expect(dispatchSpy).toHaveBeenCalledWith(
      login({
        request: {
          email: 'alex.jones@company.com',
          password: 'Password123!',
        },
      })
    );
  });

  it('should not dispatch login when form is invalid', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    component.form.patchValue({
      email: '',
      password: '',
    });

    component.onSubmit();

    expect(dispatchSpy).not.toHaveBeenCalled();
  });

  it('should include link to sign-up and home', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = compiled.querySelectorAll('a');
    const hrefs = Array.from(links).map((l) => l.getAttribute('routerLink') || l.getAttribute('href'));

    expect(hrefs.some((h) => h?.includes('/sign-up'))).toBe(true);
    expect(hrefs.some((h) => h === '/' || h?.includes('/'))).toBe(true);
  });
});
