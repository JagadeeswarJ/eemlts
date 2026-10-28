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

  it('should create and render EMS branding', () => {
    expect(component).toBeTruthy();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EMS');
  });

  it('should render hero headline and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Your workday, organized in');
  });

  it('should render all feature cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Attendance Tracking');
    expect(compiled.textContent).toContain('Leave Management');
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
    expect(compiled.textContent).toContain('EMS. All rights reserved.');
  });

  it('should toggle mobile menu signal', () => {
    expect(component.mobileMenuOpen()).toBe(false);
    component.mobileMenuOpen.set(true);
    fixture.detectChanges();
    expect(component.mobileMenuOpen()).toBe(true);
  });
});
