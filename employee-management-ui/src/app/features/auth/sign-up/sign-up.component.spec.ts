import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { SignUpComponent } from './sign-up.component';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render account access guidance', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('WorkPulse Account Access');
    expect(compiled.textContent).toContain('Organization-Provisioned Accounts');
  });

  it('should explain HR and Administrator provisioning workflow', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('provisioned exclusively by your Human Resources department');
    expect(compiled.textContent).toContain('HR Onboarding');
    expect(compiled.textContent).toContain('Quota Allocation');
  });

  it('should not contain unapproved public registration role selector', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const roleSelect = compiled.querySelector('select[name="role"]');
    expect(roleSelect).toBeNull();
  });

  it('should provide link back to sign-in page', () => {
    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    const hrefs = links.map((link) => link.injector.get(RouterLink).href);

    expect(hrefs.some((h) => h?.includes('/sign-in'))).toBe(true);
  });
});
