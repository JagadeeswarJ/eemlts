import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logout } from '../../../store/auth/auth.actions';
import { selectCurrentUser } from '../../../store/auth/auth.selectors';
import { HeaderComponent } from './header.component';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let store: MockStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        provideMockStore(),
      ],
    }).compileComponents();

    store = TestBed.inject(MockStore);
    store.overrideSelector(selectCurrentUser, {
      userId: 1,
      employeeId: 4,
      employeeCode: 'EMP004',
      email: 'alex@company.com',
      role: 'EMPLOYEE',
      firstName: 'Alex',
      lastName: 'Jones',
      fullName: 'Alex Jones',
      departmentId: 1,
      departmentName: 'Engineering',
      designation: 'Senior Engineer',
    });

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render EMS brand and current user details', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('EMS');
    expect(compiled.textContent).toContain('Alex Jones');
    expect(compiled.textContent).toContain('EMPLOYEE');
  });

  it('should emit toggleSidebar event on mobile toggle click', () => {
    const toggleSpy = vi.spyOn(component.toggleSidebar, 'emit');
    const btn = fixture.nativeElement.querySelector('button[aria-label="Toggle navigation drawer"]');
    btn?.click();

    expect(toggleSpy).toHaveBeenCalled();
  });

  it('should dispatch logout action on sign out button click', () => {
    const dispatchSpy = vi.spyOn(store, 'dispatch');
    const btn = fixture.nativeElement.querySelector('button[aria-label="Sign out of system"]');
    btn?.click();

    expect(dispatchSpy).toHaveBeenCalledWith(logout());
  });
});
