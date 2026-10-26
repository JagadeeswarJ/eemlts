import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { beforeEach, describe, expect, it } from 'vitest';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LandingComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render WorkPulse branding', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('WorkPulse');
    expect(compiled.textContent).toContain('Enterprise HR & Leaves');
  });

  it('should render hero headline and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Your workday, organized in');
    expect(compiled.textContent).toContain('one place');
    expect(compiled.textContent).toContain('Manage attendance, request leave, follow approvals');
  });

  it('should render all 6 feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Attendance Tracking');
    expect(compiled.textContent).toContain('Leave Management');
    expect(compiled.textContent).toContain('Employee Directory');
    expect(compiled.textContent).toContain('Team Approvals');
    expect(compiled.textContent).toContain('Workforce Insights');
    expect(compiled.textContent).toContain('Role-Based Access');
  });

  it('should render role benefits for Employees, Managers, and HR', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('For Staff Employees');
    expect(compiled.textContent).toContain('For Team Managers');
    expect(compiled.textContent).toContain('For HR & Administrators');
  });

  it('should contain navigation links to /sign-in and /sign-up', () => {
    const links = fixture.debugElement.queryAll(By.directive(RouterLink));
    const hrefs = links.map((link) => link.injector.get(RouterLink).href);

    expect(hrefs.some((h) => h?.includes('/sign-in'))).toBe(true);
    expect(hrefs.some((h) => h?.includes('/sign-up'))).toBe(true);
  });

  it('should render footer with current copyright year', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain(new Date().getFullYear().toString());
    expect(compiled.textContent).toContain('WorkPulse. All rights reserved.');
  });

  it('should toggle mobile menu signal', () => {
    expect(component.mobileMenuOpen()).toBe(false);
    component.mobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(component.mobileMenuOpen()).toBe(true);
  });
});
